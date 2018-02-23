import { composeWithElastic } from "graphql-compose-elasticsearch";
import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import elasticClient from "../client";
import MappedReadSchema, {
  index,
  type
} from "@capsid/mongo/schema/mappedReads";

const MappedReadEsTC = composeWithElastic({
  graphqlTypeName: "MappedReadEs",
  elasticIndex: index,
  elasticType: type,
  elasticMapping: {
    properties: generate(MappedReadSchema)
  },
  elasticClient,
  // elastic mapping does not contain information about is fields are arrays or not
  // so provide this information explicitly for obtaining correct types in GraphQL
  pluralFields: []
});

export default MappedReadEsTC;
