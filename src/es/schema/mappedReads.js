import { composeWithElastic } from "graphql-compose-elasticsearch";
import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import elasticClient from "../client";
import MappedReadSchema, {
  index,
  type
} from "@capsid/mongo/schema/mappedReads";

const generated = generate(MappedReadSchema);
const esMapping = Object.keys(generated).reduce((obj, key) => {
  const field = generated[key];
  return {
    ...obj,
    [key]: ["keyword", "text"].includes(field.type)
      ? { ...field, fields: { search: { type: "text" } } }
      : field
  };
}, {});

console.log(JSON.stringify(esMapping, null, 2));

const MappedReadEsTC = composeWithElastic({
  graphqlTypeName: "MappedReadEs",
  elasticIndex: index,
  elasticType: type,
  elasticMapping: {
    properties: esMapping
  },
  elasticClient,
  // elastic mapping does not contain information about is fields are arrays or not
  // so provide this information explicitly for obtaining correct types in GraphQL
  pluralFields: []
});

export default MappedReadEsTC;
