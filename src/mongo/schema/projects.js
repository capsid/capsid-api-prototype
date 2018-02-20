import mongoose, { Schema } from "mongoose";
import mongooseElasticsearch from "mongoose-elasticsearch-xp";
import { composeWithElastic } from "graphql-compose-elasticsearch";
import { generate } from "mongoose-elasticsearch-xp/lib/mapping";
import composeWithMongoose from "graphql-compose-mongoose";
import { GQC } from "graphql-compose";

import esClient from "@capsid/es/client";

// Embedded schema
const SalaryRangeSchema = new Schema(
  {
    from: {
      type: Number,
      es_indexed: true // mongoose-elasticsearch-xp
    },
    to: {
      type: Number,
      es_indexed: true // mongoose-elasticsearch-xp
    },
    currency: {
      type: String,
      es_indexed: true, // mongoose-elasticsearch-xp
      es_type: "keyword" // mongoose-elasticsearch-xp
    }
  },
  {
    _id: false
  }
);

// Main collection mongoose schema
export const JobSchema = new Schema(
  {
    position: {
      type: String,
      description: 'Person main position in resume, eg. "Sales manager"',
      es_indexed: true, // <------ see `graphql-elasticsearch-xp` for details
      es_boost: 3 // <------ see `graphql-elasticsearch-xp` for details
    },

    salary: {
      type: SalaryRangeSchema,
      description: "Salary with currency symbol",
      es_indexed: true // <------ see `graphql-elasticsearch-xp` for details
    },

    employment: {
      type: [
        {
          type: String
        }
      ],
      description: "List of desired employment types",
      index: true,
      es_indexed: true, // <------ see `graphql-elasticsearch-xp` for details
      es_type: "keyword" // <------ see `graphql-elasticsearch-xp` for details
    },

    visibility: {
      type: String,
      enum: ["published", "hidden", "archived"],
      description: "job visibility options",
      default: "published"
    },

    onlyMongooseData: String
  },
  {
    timestamps: true,
    es_extend: {
      // <------ see `graphql-elasticsearch-xp` for details
      createdAt: {
        // pass timestamps to elasticsearch mapping
        es_type: "date",
        es_value: doc => doc.createdAt // custom value generation
      },
      updatedAt: {
        es_type: "date",
        es_value: doc => doc.updatedAt
      },
      id_keyword: {
        // pass id as ES keyword
        es_type: "keyword",
        es_value: doc => (doc._id ? doc._id.toString() : "") // custom value generation
      }
    }
  }
);

/* elastic */
JobSchema.plugin(mongooseElasticsearch, {
  client: esClient, // <------ see `graphql-elasticsearch-xp` for details
  filter: doc => {
    if (doc.visibility !== "published") {
      // add to index new record with visibility='published'
      // or remove existed record from index if `visibility` changed and not 'published' anymore
      return false;
    }
    return true;
  }
});

export const JobEsTC = composeWithElastic({
  graphqlTypeName: "JobES",
  elasticIndex: "job",
  elasticType: "job",
  elasticMapping: {
    properties: generate(JobSchema)
  },
  esClient,
  // elastic mapping does not contain information about is fields are arrays or not
  // so provide this information explicitly for obtaining correct types in GraphQL
  pluralFields: ["employment"]
});

export const Job = mongoose.model("Job", JobSchema);
export const JobTC = composeWithMongoose(Job);

JobEsTC.getResolver("search")
  .getTypeComposer()
  .getFieldTC("hits")
  .addRelation("fromMongo", {
    resolver: () => JobTC.getResolver("findById"),
    prepareArgs: {
      _id: source => source._id
    },
    projection: { _id: true }
  });

GQC.rootQuery().addFields({
  jobEsConnection: JobEsTC.getResolver("search"),
  jobMongoConnection: JobTC.getResolver("connection"),
  jobMany: JobTC.getResolver("findMany"),
  job: JobTC.getResolver("findOnly"),
  jobById: JobTC.getResolver("findById")
});

const schema = GQC.buildSchema();

export default schema;
