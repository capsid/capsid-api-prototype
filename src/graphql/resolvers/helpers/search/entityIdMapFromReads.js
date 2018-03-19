import { MappedRead } from "@capsid/mongo/schema/mappedReads";

export default async ({ entitiesWithIds }) => {
  const response = await MappedRead.esSearch({
    size: 0,
    query: {
      bool: {
        must: entitiesWithIds.map(({ name, results, mappedReadField }) => ({
          terms: { [mappedReadField]: results }
        }))
      }
    },
    aggs: entitiesWithIds.reduce(
      (obj, x) => ({
        ...obj,
        [x.name]: { terms: { field: x.mappedReadField, size: 999999 } }
      }),
      {}
    )
  });
  return Object.keys(response.aggregations).reduce(
    (obj, k) => ({
      ...obj,
      [k]: response.aggregations[k].buckets.map(({ key }) => key)
    }),
    {}
  );
};
