import { GraphQLSchema, GraphQLObjectType } from "graphql";
import { composeWithElastic } from "graphql-compose-elasticsearch";

import client from "@capsid/query/client";
import projects from "@capsid/mappings/projects";
import samples from "@capsid/mappings/samples";

const mappings = {
  Projects: projects,
  Samples: samples
};

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: Object.keys(mappings)
      .map(key => ({
        graphqlTypeName: key,
        elasticIndex: key.toLowerCase(),
        elasticType: "_doc",
        elasticMapping: mappings[key].mapping,
        pluralFields: mappings[key].pluralFields
      }))
      .map(config => ({
        config,
        esTc: composeWithElastic({ ...config, elasticClient: client })
      }))
      .reduce(
        (obj, x) => ({
          ...obj,
          [x.config.elasticIndex]: x.esTc.get("$search").getFieldConfig(),
          [`${x.config.elasticIndex}Connection`]: x.esTc
            .get("$searchConnection")
            .getFieldConfig()
        }),
        {}
      )
  })
});

export default schema;
