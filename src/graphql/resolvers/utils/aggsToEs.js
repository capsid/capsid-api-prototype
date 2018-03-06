import AggProcessor from "@arranger/middleware/dist/aggregations";

export default ({ sqon, aggs }) => {
  const graphql_fields = aggs.reduce(
    (obj, x) => ({
      ...obj,
      [x.field]: {
        [x.type === "terms" ? "buckets" : "stats"]: {}
      }
    }),
    {}
  );
  const built = new AggProcessor().buildAggregations({
    type: { name: "" },
    nested_fields: [],
    fields: Object.keys(graphql_fields),
    graphql_fields,
    args: {
      filters: sqon,
      aggregations_filter_themselves: false
    }
  });
  return built.aggs;
};
