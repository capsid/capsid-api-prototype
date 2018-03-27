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

  const results = await resultsFromEntityIds({
    ...entities.find(x => x.name === agg.entity),
    ids: idMap[agg.entity],
    sqon: filteredSqon,
    aggs: aggs[agg.entity],
    aggregationsFilterThemselves: true
  });

  return { aggs: results.aggs };
};
