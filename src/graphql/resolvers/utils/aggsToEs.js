export default aggs =>
  aggs.reduce(
    (obj, { field, type }) => ({
      ...obj,
      [field]: { [type]: { field } }
    }),
    {}
  );
