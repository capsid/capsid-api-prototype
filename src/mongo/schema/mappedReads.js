import mongoose, { Schema } from "mongoose";
import mongooseElasticsearch from "mongoose-elasticsearch-xp";

import elasticClient from "@capsid/es/client";

const collection = "mapped";
export const index = "mapped";
export const type = "_doc";

const MappedReadSchema = new Schema(
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
    alignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alignment",
      es_indexed: true,
      es_type: "keyword"
    },
    alignmentName: {
      type: String,
      description: "alignment name",
      es_indexed: true,
      es_type: "keyword"
    },
    sequence: {
      type: String,
      description: "sequence",
      es_indexed: true,
      es_type: "text"
    },
    refStart: {
      type: Number,
      description: "ref start",
      es_indexed: true,
      es_type: "long"
    },
    refEnd: {
      type: Number,
      description: "ref end",
      es_indexed: true,
      es_type: "long"
    },
    pg: {
      type: String,
      description: "pg",
      es_indexed: true,
      es_type: "keyword"
    },
    readId: {
      type: String,
      description: "read id",
      es_indexed: true,
      es_type: "keyword"
    },
    platform: {
      type: String,
      description: "platform",
      es_indexed: true,
      es_type: "keyword"
    },
    mapq: {
      type: Number,
      description: "map q",
      es_indexed: true,
      es_type: "long"
    },
    pairEnd: {
      type: Number,
      description: "pair end",
      es_indexed: true,
      es_type: "long"
    },
    minQual: {
      type: Number,
      description: "min qual",
      es_indexed: true,
      es_type: "long"
    },
    avgQual: {
      type: Number,
      description: "avg qual",
      es_indexed: true,
      es_type: "double"
    },
    genome: {
      type: Number,
      description: "genome id (gi)",
      es_indexed: true,
      es_type: "long"
    },
    genome: {
      type: Number,
      description: "genome id (gi)",
      es_indexed: true,
      es_type: "long"
    },
    md: {
      type: String,
      description: "platform",
      es_indexed: true,
      es_type: "keyword"
    },
    cigar: {
      type: Array,
      description: "cigar",
      es_indexed: true,
      es_type: "long"
    },
    mismatch: {
      type: Number,
      description: "mismatch",
      es_indexed: true,
      es_type: "long"
    },
    miscalls: {
      type: Number,
      description: "miscalls",
      es_indexed: true,
      es_type: "long"
    },
    readLength: {
      type: Number,
      description: "read length",
      es_indexed: true,
      es_type: "long"
    },
    alignLength: {
      type: Number,
      description: "align length",
      es_indexed: true,
      es_type: "long"
    },
    alignScore: {
      type: Number,
      description: "align score",
      es_indexed: true,
      es_type: "long"
    },
    mapsGene: {
      type: Array,
      description: "maps gene",
      es_indexed: true,
      es_type: "keyword"
    },
    qqual: {
      type: String,
      description: "q qual",
      es_indexed: true,
      es_type: "keyword"
    },
    sequencingType: {
      type: String,
      description: "sequencing type",
      es_indexed: true,
      es_type: "keyword"
    },
    refStrand: {
      type: Number,
      description: "ref strang",
      es_indexed: true,
      es_type: "long"
    },
    isRef: {
      type: Boolean,
      description: "is ref",
      es_indexed: true,
      es_type: "boolean"
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

MappedReadSchema.plugin(mongooseElasticsearch, {
  client: elasticClient,
  index,
  type
});

export const MappedRead = mongoose.model("MappedRead", MappedReadSchema);

export default MappedReadSchema;
