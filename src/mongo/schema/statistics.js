import mongoose from "mongoose";
import mongooseElasticsearch from "mongoose-elasticsearch-xp";

import elasticClient from "@capsid/es/client";

const collection = "statistics";
export const index = "statistics";

const StatisticsSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      es_indexed: true,
      es_type: "keyword"
    },
    project: {
      type: String,
      es_indexed: true,
      es_type: "keyword"
    },
    projectLabel: {
      type: String,
      es_indexed: true,
      es_type: "keyword"
    },
    sampleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sample",
      es_indexed: true,
      es_type: "keyword"
    },
    sample: {
      type: String,
      es_indexed: true,
      es_type: "keyword"
    },
    ownerType: {
      type: String,
      es_indexed: true,
      es_type: "keyword"
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      es_indexed: true,
      es_type: "keyword"
    },
    gi: {
      type: Number,
      es_indexed: true,
      es_type: "keyword"
    },
    accession: {
      type: String,
      es_indexed: true,
      es_type: "keyword"
    },
    genome: {
      type: String,
      es_indexed: true,
      es_type: "keyword"
    },
    genomeHits: {
      type: Number,
      es_indexed: true,
      es_type: "long"
    },
    genomeCoverage: {
      type: Number,
      es_indexed: true,
      es_type: "double"
    },
    pathgenomeHits: {
      type: Number,
      es_indexed: true,
      es_type: "long"
    },
    pathgenomeCoverage: {
      type: Number,
      es_indexed: true,
      es_type: "double"
    },
    geneHits: {
      type: Number,
      es_indexed: true,
      es_type: "long"
    },
    geneCoverageMax: {
      type: Number,
      es_indexed: true,
      es_type: "double"
    },
    geneCoverageAvg: {
      type: Number,
      es_indexed: true,
      es_type: "double"
    },
    pathgeneHits: {
      type: Number,
      es_indexed: true,
      es_type: "long"
    },
    pathgeneCoverageMax: {
      type: Number,
      es_indexed: true,
      es_type: "double"
    },
    pathgeneCoverageAvg: {
      type: Number,
      es_indexed: true,
      es_type: "double"
    },
    tags: {
      type: Array,
      es_indexed: true,
      es_type: "keyword"
    }
  },
  {
    collection,
    timestamps: true,
    es_extend: {
      createdAt: {
        es_type: "date",
        es_value: doc => doc.createdAt
      },
      updatedAt: {
        es_type: "date",
        es_value: doc => doc.updatedAt
      },
      id: {
        es_type: "keyword",
        es_value: doc => (doc._id ? doc._id.toString() : "")
      }
    }
  }
);

StatisticsSchema.plugin(mongooseElasticsearch, {
  client: elasticClient,
  index,
  type: "_doc"
});

export const Statistics = mongoose.model("Statistics", StatisticsSchema);

export default StatisticsSchema;
