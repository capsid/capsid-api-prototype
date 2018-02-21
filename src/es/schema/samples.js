import { composeWithElastic } from "graphql-compose-elasticsearch";
import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import elasticClient from "../client";
import SampleSchema from "@capsid/mongo/schema/samples";

const SampleEsTC = composeWithElastic({
  graphqlTypeName: "SampleEs",
  elasticIndex: "samples",
  elasticType: "_doc",
  elasticMapping: {
    properties: generate(SampleSchema)
  },
  elasticClient,
  // elastic mapping does not contain information about is fields are arrays or not
  // so provide this information explicitly for obtaining correct types in GraphQL
  pluralFields: []
});

export default SampleEsTC;