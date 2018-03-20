import client from "@capsid/es/client";
import { sqonToEs } from "@capsid/graphql/resolvers/utils";
import { Access } from "@capsid/mongo/schema/access";

const fetchAllIds = async ({ index, field, entity, query, aggs }) => {
  const response = await client.search({
    index,
    type: "_doc",
    size: 0,
    body: {
      query,
      aggs: { unique: { terms: { field, size: 99999999 } } }
    }
  });
  return {
    ...entity,
    results: response.aggregations.unique.buckets.map(({ key }) => key)
  };
};

export default async ({ entities, sqonByEntity, user }) => {
  const userScope = !user.superUser && {
    projectId: (await Access.find({ userId: user.id })).map(x => x.projectId)
  };
  const entitiesWithIds = await Promise.all(
    entities.map(entity =>
      fetchAllIds({
        entity,
        field: entity.field || "_id",
        index: entity.index,
        query: {
          bool: {
            must: [
              ...(entity.scope && userScope
                ? Object.keys(entity.scope).map(k => ({
                    terms: { [entity.scope[k]]: userScope[k] }
                  }))
                : []),
              ...(sqonByEntity[entity.name]
                ? [{ ...sqonToEs(sqonByEntity[entity.name]) }]
                : [])
            ]
          }
        }
      })
    )
  );
  if (!sqonByEntity.statistics) return entitiesWithIds;
  return await Promise.all(
    entitiesWithIds.map(({ results, ...entity }) =>
      fetchAllIds({
        entity,
        field: entity.field || "ownerId",
        index: "statistics",
        query: {
          bool: {
            must: [
              ...(entity.field
                ? [{ terms: { [entity.field]: results } }]
                : [
                    { term: { ownerType: entity.name.slice(0, -1) } },
                    { terms: { ownerId: results } }
                  ]),
              ...[{ ...sqonToEs(sqonByEntity.statistics) }]
            ]
          }
        }
      })
    )
  );
};
