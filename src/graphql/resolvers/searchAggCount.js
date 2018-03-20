import { splitSqon } from "@capsid/graphql/resolvers/utils";
import { searchEntities as entities } from "@capsid/graphql/resolvers/config";
import {
  entityIdsFromSqon,
  entityIdMapFromReads,
  resultsFromEntityIds
} from "@capsid/graphql/resolvers/helpers/search";

const removeFieldFromSqon = ({ sqon, field, entity }) => ({
  ...sqon,
  content: sqon.content.filter(x => x.content.field !== `${entity}.${field}`)
});

const parseAggs = ({ field, type, aggs }) => {
  const aggRoot = aggs[`${field}:global`]
    ? aggs[`${field}:global`][`${field}:filtered`]
    : aggs;

  return type === "stats"
    ? { stats: aggRoot[`${field}:stats`] }
    : aggRoot[field];
};

export default async ({
  context: { user },
  args,
  info,
  sqon = JSON.parse(args.query),
  aggs = JSON.parse(args.aggs),
  agg = JSON.parse(args.agg),
  filteredSqon = sqon && removeFieldFromSqon({ sqon, ...agg }),
  sqonByEntity = splitSqon(filteredSqon)
}) => {
  const entitiesWithIds = await entityIdsFromSqon({
    entities,
    sqonByEntity,
    user
  });

  const idMap = await entityIdMapFromReads({ entitiesWithIds });

  const results = await (agg.entity === "statistics"
    ? resultsFromEntityIds({
        name: "statistics",
        query: {
          bool: {
            should: ["projects", "samples", "alignments"].map(x => ({
              bool: {
                must: [
                  { term: { ownerType: x.slice(0, -1) } },
                  { terms: { ownerId: idMap[x] } },
                  { terms: { gi: idMap["genomes"] } }
                ]
              }
            }))
          }
        },
        sqon: sqonByEntity.statistics,
        aggs: aggs.statistics,
        index: "statistics"
      })
    : resultsFromEntityIds({
        ...entities.find(x => x.name === agg.entity),
        ids: idMap[agg.entity],
        sqon: filteredSqon,
        aggs: aggs[agg.entity]
      }));

  return parseAggs({ field: agg.field, type: agg.type, aggs: results.aggs });
};
