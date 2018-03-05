import mongoose from "mongoose";
import mongooseElasticsearch from "mongoose-elasticsearch-xp";

import elasticClient from "@capsid/es/client";

export const collection = "project";
export const index = "projects";

const ProjectSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      description: "description",
      es_indexed: true,
      es_type: "text"
    },
    roles: {
      type: Array,
      description: "roles",
      es_indexed: true,
      es_type: "keyword"
    },
    label: {
      type: String,
      description: "label",
      es_indexed: true,
      es_type: "keyword"
    },
    version: {
      type: Number,
      description: "version",
      es_indexed: true,
      es_type: "long"
    },
    wikiLink: {
      type: String,
      description: "wikiLink",
      es_indexed: true,
      es_type: "text"
    },
    name: {
      type: String,
      description: "name",
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

ProjectSchema.plugin(mongooseElasticsearch, {
  client: elasticClient,
  index,
  type: "_doc"
});

export const Project = mongoose.model("Project", ProjectSchema);

export default ProjectSchema;
