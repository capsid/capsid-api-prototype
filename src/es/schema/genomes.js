import { composeWithElastic } from "graphql-compose-elasticsearch";
import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import elasticClient from "../client";
import GenomeSchema, { index, type } from "@capsid/mongo/schema/alignments";

const GenomeEsTC = composeWithElastic({
  graphqlTypeName: "GenomeEs",
  elasticIndex: index,
  elasticType: type,
  elasticMapping: {
    properties: generate(GenomeSchema)
  },
  elasticClient,
  // elastic mapping does not contain information about is fields are arrays or not
  // so provide this information explicitly for obtaining correct types in GraphQL
  pluralFields: []
});

export default GenomeEsTC;
