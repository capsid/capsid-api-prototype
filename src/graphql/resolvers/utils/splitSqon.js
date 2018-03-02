
export default sqon => {
  const sqonMap = sqon.content.reduce((obj, x) => {
    const { content, op } = x;
    if (["and", "or"].includes(op))
      throw new Error("Nested operations are not supported");
    const { field, fields } = content;
    const namespace = (field || fields[0]).split(".")[0];
    const denamespace = x =>
      x
        .split(".")
        .slice(1)
        .join(".");
    const newFieldContent = field
      ? {
          field: denamespace(field)
        }
      : {
          fields: fields.map(x => denamespace(x))
        };
    return {
      ...obj,
      [namespace]: [
        ...(obj[namespace] || []),
        { op, content: { ...content, ...newFieldContent } }
      ]
    };
  }, {});
  return Object.keys(sqonMap).reduce(
    (obj, k) => ({
      ...obj,
      [k]: { op: "and", content: sqonMap[k] }
    }),
    {}
  );
};
