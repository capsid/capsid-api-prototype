import { searchEntities as entities } from "@capsid/graphql/resolvers/config";
import { index as mappedIndex } from "@capsid/mongo/schema/mappedReads";

const decorators = {
  [mappedIndex]: ({ key, field }) =>
    entities.map(e => e.mappedReadField).includes(key)
      ? { ...field, eager_global_ordinals: true }
      : field
};

export default ({ index, mapping }) =>
  Object.keys(mapping).reduce((obj, key) => {
    const field = mapping[key];
    const withTextField = ["keyword", "text", "long"].includes(field.type)
      ? { ...field, fields: { search: { type: "text" } } }
      : field;
    return {
      ...obj,
      [key]: decorators[index]
        ? decorators[index]({ key, field: withTextField })
        : withTextField
    };
  }, {});
