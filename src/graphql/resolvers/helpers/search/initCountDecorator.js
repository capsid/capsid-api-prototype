import _ from "lodash";

import { Sample } from "@capsid/mongo/schema/samples";
import { Alignment } from "@capsid/mongo/schema/alignments";
import { Statistics } from "@capsid/mongo/schema/statistics";

const countSearch = ({
  agg,
  idMap,
  field,
  Model = agg === "projects" ? Project : agg === "samples" ? Sample : Alignment
}) =>
  Model.esSearch({
    size: 0,
    query: { terms: { _id: idMap[agg] } },
    aggs: { [agg]: { terms: { field, size: 999999 } } }
  });

const countStatisticsSearch = ({ ownerType, idMap, agg, field }) =>
  Statistics.esSearch({
    size: 0,
    query: {
      bool: {
        must: [
          { term: { ownerType } },
          { terms: { ownerId: idMap[`${ownerType}s`] } },
          { terms: { gi: idMap["genomes"] } }
        ]
      }
    },
    aggs: { [agg]: { terms: { field, size: 999999 } } }
  });

const initCountDecorator = async ({ name, hits, idMap }) => {
  if (!hits || _.isEmpty(hits)) return null;
  let searches;
  if (name === "projects") {
    searches = [
      countSearch({ agg: "samples", field: "projectId", idMap }),
      countSearch({ agg: "alignments", field: "projectId", idMap }),
      countStatisticsSearch({
        ownerType: "project",
        idMap,
        agg: "genomes",
        field: "ownerId"
      })
    ];
  } else if (name === "samples") {
    searches = [
      countSearch({ agg: "alignments", field: "sampleId", idMap }),
      countStatisticsSearch({
        ownerType: "sample",
        idMap,
        agg: "genomes",
        field: "ownerId"
      })
    ];
  } else if (name === "alignments") {
    searches = [
      countStatisticsSearch({
        ownerType: "alignment",
        idMap,
        agg: "genomes",
        field: "ownerId"
      })
    ];
  } else if (name === "genomes") {
    searches = [
      countStatisticsSearch({
        ownerType: "project",
        idMap,
        agg: "projects",
        field: "gi"
      }),
      countStatisticsSearch({
        ownerType: "sample",
        idMap,
        agg: "samples",
        field: "gi"
      }),
      countStatisticsSearch({
        ownerType: "alignment",
        idMap,
        agg: "alignments",
        field: "gi"
      })
    ];
  }
  const responses = await Promise.all(searches);
  return x =>
    responses
      .map(({ aggregations, name = Object.keys(aggregations)[0] }) => ({
        name,
        counts: aggregations[name].buckets
      }))
      .reduce(
        (obj, r) => ({
          ...obj,
          [r.name]: r.counts.find(
            b => b.key === (name === "genomes" ? `${x.gi}` : x.id)
          )?.doc_count
        }),
        {}
      );
};

export default initCountDecorator;
