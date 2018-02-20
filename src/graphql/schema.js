import { GQC } from "graphql-compose";

import ProjectEsTC from "@capsid/es/schema/projects";
import ProjectTC from "@capsid/mongo/schema/projects";

GQC.rootQuery().addFields({
  projectsEsConnection: ProjectEsTC.getResolver("search"),
  projectsMongoConnection: ProjectTC.getResolver("connection"),
  projectsMany: ProjectTC.getResolver("findMany"),
  projects: ProjectTC.getResolver("findOnly"),
  projectsById: ProjectTC.getResolver("findById")
});

const schema = GQC.buildSchema();

export default schema;
