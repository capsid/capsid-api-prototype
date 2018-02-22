import mongoose, { Schema } from "mongoose";
import mongooseElasticsearch from "mongoose-elasticsearch-xp";

import elasticClient from "@capsid/es/client";

const collection = "alignment";
export const index = "alignments";
export const type = "_doc";

const AlignmentSchema = new Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      es_indexed: true,
      es_type: "keyword"
    },
    projectLabel: {
      type: String,
      description: "projectLabel",
      es_indexed: true,
      es_type: "keyword"
    },
    sampleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sample",
      es_indexed: true,
      es_type: "keyword"
    },
    sampleName: {
      type: String,
      description: "sample",
      es_indexed: true,
      es_type: "keyword"
    },
    aligner: {
      type: String,
      description: "aligner",
      es_indexed: true,
      es_type: "keyword"
    },
    name: {
      type: String,
      description: "name",
      es_indexed: true,
      es_type: "keyword"
    },
    platform: {
      type: String,
      description: "platform",
      es_indexed: true,
      es_type: "keyword"
    },
    type: {
      type: String,
      description: "type",
      es_indexed: true,
      es_type: "keyword"
    },
    version: {
      type: Number,
      description: "version",
      es_indexed: true,
      es_type: "long"
    },
    outfile: {
      type: String,
      description: "outfile",
      es_indexed: true,
      es_type: "text"
    },
    infile: {
      type: String,
      description: "infile",
      es_indexed: true,
      es_type: "text"
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

AlignmentSchema.plugin(mongooseElasticsearch, {
  client: elasticClient,
  index,
  type
});

export const Alignment = mongoose.model("Alignment", AlignmentSchema);

export default AlignmentSchema;
