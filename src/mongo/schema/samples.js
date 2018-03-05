import mongoose from "mongoose";
import mongooseElasticsearch from "mongoose-elasticsearch-xp";

import elasticClient from "@capsid/es/client";

const collection = "sample";
export const index = "samples";

const SampleSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      es_indexed: true,
      es_type: "keyword"
    },
    source: {
      type: String,
      description: "source",
      es_indexed: true,
      es_type: "keyword"
    },
    projectLabel: {
      type: String,
      description: "projectLabel",
      es_indexed: true,
      es_type: "keyword"
    },
    role: {
      type: String,
      description: "role",
      es_indexed: true,
      es_type: "keyword"
    },
    description: {
      type: String,
      description: "description",
      es_indexed: true,
      es_type: "text"
    },
    cancer: {
      type: String,
      description: "cancer",
      es_indexed: true,
      es_type: "keyword"
    },
    name: {
      type: String,
      description: "name",
      es_indexed: true,
      es_type: "keyword"
    },
    version: {
      type: Number,
      description: "version",
      es_indexed: true,
      es_type: "long"
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

SampleSchema.plugin(mongooseElasticsearch, {
  client: elasticClient,
  index,
  type: "_doc"
});

export const Sample = mongoose.model("Sample", SampleSchema);

export default SampleSchema;
