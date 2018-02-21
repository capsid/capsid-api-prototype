import { composeWithElastic } from "graphql-compose-elasticsearch";
import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import elasticClient from "../client";
import AlignmentSchema from "@capsid/mongo/schema/alignments";

const AlignmentEsTC = composeWithElastic({
  graphqlTypeName: "AlignmentEs",
  elasticIndex: "alignments",
  elasticType: "_doc",
  elasticMapping: {
    properties: generate(AlignmentSchema)
  },
  elasticClient,
  // elastic mapping does not contain information about is fields are arrays or not
  // so provide this information explicitly for obtaining correct types in GraphQL
  pluralFields: []
});

export default AlignmentEsTC;
