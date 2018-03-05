import mongoose from "mongoose";
import mongooseElasticsearch from "mongoose-elasticsearch-xp";

import elasticClient from "@capsid/es/client";

const collection = "genome";
export const index = "genomes";

const GenomeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      description: "name",
      es_indexed: true,
      es_type: "keyword"
    },
    length: {
      type: Number,
      description: "length",
      es_indexed: true,
      es_type: "long"
    },
    organism: {
      type: String,
      description: "organism",
      es_indexed: true,
      es_type: "keyword"
    },
    taxonomy: {
      type: Array,
      description: "taxonomy",
      es_indexed: true,
      es_type: "keyword"
    },
    strand: {
      type: Boolean,
      description: "strand",
      es_indexed: true,
      es_type: "boolean"
    },
    accession: {
      type: String,
      description: "accession",
      es_indexed: true,
      es_type: "keyword"
    },
    gi: {
      type: Number,
      description: "gi",
      es_indexed: true,
      es_type: "long"
    },
    taxonId: {
      type: Number,
      description: "taxonId",
      es_indexed: true,
      es_type: "long"
    },
    left: {
      type: Number,
      description: "left",
      es_indexed: true,
      es_type: "long"
    },
    sampleCount: {
      type: Number,
      description: "strand",
      es_indexed: true,
      es_type: "long"
    },
    samples: {
      type: Array,
      description: "samples",
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

GenomeSchema.plugin(mongooseElasticsearch, {
  client: elasticClient,
  index,
  type: "_doc"
});

export const Genome = mongoose.model("Genome", GenomeSchema);

export default GenomeSchema;
