export default ({ field, type, aggs }) => {
  const aggRoot = aggs[`${field}:global`]
    ? aggs[`${field}:global`][`${field}:filtered`]
    : aggs;

  return type === "stats"
    ? { stats: aggRoot[`${field}:stats`] }
    : aggRoot[field];
};
