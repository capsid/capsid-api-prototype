import { composeWithElastic } from "graphql-compose-elasticsearch";
import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import elasticClient from "../client";
import ProjectsSchema, { index, type } from "@capsid/mongo/schema/projects";

const ProjectEsTC = composeWithElastic({
  graphqlTypeName: "ProjectEs",
  elasticIndex: index,
  elasticType: type,
  elasticMapping: {
    properties: generate(ProjectsSchema)
  },
  elasticClient,
  // elastic mapping does not contain information about is fields are arrays or not
  // so provide this information explicitly for obtaining correct types in GraphQL
  pluralFields: []
});

export default ProjectEsTC;
