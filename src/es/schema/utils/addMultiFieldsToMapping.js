export default mapping =>
  Object.keys(mapping).reduce((obj, key) => {
    const field = mapping[key];
    return {
      ...obj,
      [key]: ["keyword", "text"].includes(field.type)
        ? { ...field, fields: { search: { type: "text" } } }
        : field
    };
  }, {});
