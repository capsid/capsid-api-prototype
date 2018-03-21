import { buildQuery, buildAggregations } from "@arranger/middleware";

export default ({ sqon, aggs }) => {
  const graphqlFields = aggs.reduce(
    (obj, x) => ({
      ...obj,
      [x.field]: {
        [x.type === "terms" ? "buckets" : "stats"]: {}
      }
    }),
    {}
  );
  return buildAggregations({
    nestedFields: [],
    graphqlFields,
    query: buildQuery({ nestedFields: [], filters: sqon }),
    aggregationsFilterThemselves: true
  });
};
