import _ from "lodash";

import { Sample } from "@capsid/mongo/schema/samples";
import { Alignment } from "@capsid/mongo/schema/alignments";
import { Statistics } from "@capsid/mongo/schema/statistics";
import { MappedRead } from "@capsid/mongo/schema/mappedReads";

const countMappedSearch = ({ field, ids, size }) =>
  MappedRead.esSearch({
    size: 0,
    query: {
      bool: {
        must: [
          { terms: { projectId: ids["projects"] } },
          { terms: { sampleId: ids["samples"] } },
          { terms: { alignmentId: ids["alignments"] } },
          { terms: { genome: ids["genomes"] } }
        ]
      }
    },
    aggs: {
      count: {
        terms: { field, size },
        aggs: {
          projects: { cardinality: { field: "projectId" } },
          samples: { cardinality: { field: "sampleId" } },
          alignments: { cardinality: { field: "alignmentId" } },
          genomes: { cardinality: { field: "genome" } }
        }
      }
    }
  });

const initCountDecorator = async ({ entity, hits, idMap }) => {
  const response = await countMappedSearch({
    size: hits.length,
    field: entity.mappedReadField,
    ids: {
      ...idMap,
      [entity.name]: hits.map(x => x[entity.field] || x.id)
    }
  });
  return x => {
    const bucket = response.aggregations.count.buckets.find(
      b => `${b.key}` === `${x[entity.field] || x.id}`
    );
    return {
      projects: bucket.projects.value,
      samples: bucket.samples.value,
      alignments: bucket.alignments.value,
      genomes: bucket.genomes.value
    };
  };
};

export default initCountDecorator;
