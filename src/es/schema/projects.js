import { composeWithElastic } from "graphql-compose-elasticsearch";
import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import elasticClient from "../client";
import ProjectsSchema from "@capsid/mongo/schema/projects";

const ProjectEsTC = composeWithElastic({
  graphqlTypeName: "ProjectsES",
  elasticIndex: "projects",
  elasticType: "_doc",
  elasticMapping: {
    properties: generate(ProjectsSchema).schema
  },
  elasticClient,
  // elastic mapping does not contain information about is fields are arrays or not
  // so provide this information explicitly for obtaining correct types in GraphQL
  pluralFields: []
});

export default ProjectEsTC;
