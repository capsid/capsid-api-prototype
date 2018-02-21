import { GQC } from "graphql-compose";

import ProjectEsTC from "@capsid/es/schema/projects";
import { ProjectTC } from "@capsid/graphql/projects";

import SampleEsTC from "@capsid/es/schema/samples";
import { SampleTC } from "@capsid/graphql/samples";

import AlignmentEsTC from "@capsid/es/schema/alignments";
import { AlignmentTC } from "@capsid/graphql/alignments";

GQC.rootQuery().addFields({
  projectEsConnection: ProjectEsTC.getResolver("searchConnection"),
  projectMongoConnection: ProjectTC.getResolver("connection"),
  projectMany: ProjectTC.getResolver("findMany"),
  projectOne: ProjectTC.getResolver("findOne"),
  projectById: ProjectTC.getResolver("findById"),

  sampleEsConnection: SampleEsTC.getResolver("searchConnection"),
  sampleMongoConnection: SampleTC.getResolver("connection"),
  sampleMany: SampleTC.getResolver("findMany"),
  sampleOne: SampleTC.getResolver("findOne"),
  sampleById: SampleTC.getResolver("findById"),

  alignmentEsConnection: AlignmentEsTC.getResolver("searchConnection"),
  alignmentMongoConnection: AlignmentTC.getResolver("connection"),
  alignmentMany: AlignmentTC.getResolver("findMany"),
  alignmentOne: AlignmentTC.getResolver("findOne"),
  alignmentById: AlignmentTC.getResolver("findById")
});

const schema = GQC.buildSchema();

export default schema;
