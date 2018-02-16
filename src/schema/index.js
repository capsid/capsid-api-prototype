import { GraphQLSchema, GraphQLObjectType } from "graphql";
import { composeWithElastic } from "graphql-compose-elasticsearch";

import client from "@capsid/query/client";
import projects from "@capsid/mappings/projects";

const ProjectEsTC = composeWithElastic({
  graphqlTypeName: "Projects",
  elasticIndex: "projects",
  elasticType: "_doc",
  elasticMapping: projects,
  elasticClient: client,
  // elastic mapping does not contain information about is fields are arrays or not
  // so provide this information explicitly for obtaining correct types in GraphQL
  pluralFields: []
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      projects: ProjectEsTC.get("$search").getFieldConfig(),
      projectsConnection: ProjectEsTC.get("$searchConnection").getFieldConfig()
    }
  })
});

export default schema;