import { GQC } from "graphql-compose";

import ProjectEsTC from "@capsid/es/schema/projects";
import { ProjectTC } from "@capsid/graphql/projects";

import SampleEsTC from "@capsid/es/schema/samples";
import { SampleTC } from "@capsid/graphql/samples";

GQC.rootQuery().addFields({
  projectEs: ProjectEsTC.getResolver("search"),
  projectEsConnection: ProjectEsTC.getResolver("searchConnection"),
  projectMongoConnection: ProjectTC.getResolver("connection"),
  projectMany: ProjectTC.getResolver("findMany"),
  projectOne: ProjectTC.getResolver("findOne"),
  projectById: ProjectTC.getResolver("findById"),

  sampleEs: SampleEsTC.getResolver("search"),
  sampleEsConnection: SampleEsTC.getResolver("searchConnection"),
  sampleMongoConnection: SampleTC.getResolver("connection"),
  sampleMany: SampleTC.getResolver("findMany"),
  sampleOne: SampleTC.getResolver("findOne"),
  sampleById: SampleTC.getResolver("findById")
});

const schema = GQC.buildSchema();

export default schema;
