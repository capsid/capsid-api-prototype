import _ from "lodash";
import { parseResolveInfo } from "graphql-parse-resolve-info";

import {
  initStatsDecorator,
  initCountDecorator,
  entityIdsFromSqon,
  entityIdMapFromReads,
  resultsFromEntityIds
} from "@capsid/graphql/resolvers/helpers/search";
import { splitSqon } from "@capsid/graphql/resolvers/utils";
import { searchEntities as entities } from "@capsid/graphql/resolvers/config";

const fetchResults = ({
  entities,
  aggs,
  info,
  idMap,
  sqonByEntity,
  fieldInfo = parseResolveInfo(info)
}) =>
  Promise.all(
    entities
      .map(x => ({
        ...x,
        gqlFields:
          fieldInfo.fieldsByTypeName.Search[x.name]?.fieldsByTypeName[
            x.typeName
          ]
      }))
      .filter(({ gqlFields }) => !!gqlFields)
      .map(({ gqlFields: { hits }, ...x }) => ({
        ...x,
        scrollId: hits?.args?.after,
        sort: hits?.args?.sort,
        size: hits?.args?.size
      }))
      .map(({ name, field, index, scrollId, sort, size }) =>
        resultsFromEntityIds({
          name,
          field,
          ids: idMap[name],
          sqon: sqonByEntity[name],
          index,
          scrollId,
          sort,
          size
        })
      )
  );

const decorateResults = ({ results, idMap, entities }) =>
  Promise.all(
    results.map(async result => {
      const { name, hits } = result;
      if (!hits || _.isEmpty(hits)) return result;
      const entity = entities.find(x => x.name === name);
      const [statsDecorator, countDecorator] = await Promise.all([
        initStatsDecorator({ entity, hits, idMap }),
        initCountDecorator({ entity, hits, idMap })
      ]);
      return {
        ...result,
        hasStatistics: !!statsDecorator,
        hits: hits.map(x => {
          const statistics = statsDecorator?.(x) || [];
          const counts = countDecorator?.(x) || [];
          const cacheId = JSON.stringify({ id: x.id, statistics, counts });
          return {
            ...x,
            cacheId,
            statistics,
            counts
          };
        })
      };
    })
  );

export default async ({
  context: { user },
  args,
  info,
  sqon = JSON.parse(args.query),
  aggs = JSON.parse(args.aggs),
  sqonByEntity = splitSqon(sqon)
}) => {
  const entitiesWithIds = await entityIdsFromSqon({
    entities,
    sqonByEntity,
    user
  });

  const idMap = await entityIdMapFromReads({ entitiesWithIds });

  const results = await fetchResults({
    entities,
    aggs,
    idMap,
    sqonByEntity,
    info
  });

  const decoratedResults = await decorateResults({ results, idMap, entities });

  return decoratedResults.reduce(
    (obj, { name, ...x }) => ({ ...obj, [name]: x }),
    {}
  );
};
