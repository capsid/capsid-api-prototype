import { composeWithElastic } from "graphql-compose-elasticsearch";
import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import elasticClient from "@capsid/es/client";
import { decorateMapping } from "@capsid/es/schema/utils";

const pluralFieldsFromSchema = schema =>
  Object.keys(schema.paths).filter(key => schema.paths[key].$isMongooseArray);

export default ({ typeName, index, type, schema }) =>
  composeWithElastic({
    graphqlTypeName: `${typeName}Es`,
    elasticIndex: index,
    elasticType: type,
    elasticMapping: {
      properties: decorateMapping({ index, mapping: generate(schema) })
    },
    elasticClient,
    pluralFields: pluralFieldsFromSchema(schema)
  });
