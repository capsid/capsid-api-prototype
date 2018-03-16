import { GQC } from "graphql-compose";

import ProjectEsTC from "@capsid/es/schema/projects";
import { ProjectTC } from "@capsid/graphql/projects";

import SampleEsTC from "@capsid/es/schema/samples";
import { SampleTC } from "@capsid/graphql/samples";

import AlignmentEsTC from "@capsid/es/schema/alignments";
import { AlignmentTC } from "@capsid/graphql/alignments";

import GenomeEsTC from "@capsid/es/schema/genomes";
import { GenomeTC } from "@capsid/graphql/genomes";

import { AccessTC } from "@capsid/graphql/access";

import { LoginTC } from "@capsid/graphql/login";
import { SearchTC } from "@capsid/graphql/search";

import { withUser, withProjectAdminAccess } from "@capsid/graphql/resolvers";

GQC.rootQuery().addFields({
  login: LoginTC.getResolver("login"),

  ...withUser({
    search: SearchTC.getResolver("search"),

    projectById: ProjectTC.getResolver("findById"),
    sampleById: SampleTC.getResolver("findById"),
    alignmentById: AlignmentTC.getResolver("findById"),
    genomeById: GenomeTC.getResolver("findById"),

    accessMany: AccessTC.getResolver("findMany")
  })
});

GQC.rootMutation().addFields({
  ...withUser({
    ...withProjectAdminAccess({
      accessAdd: AccessTC.getResolver("accessAdd"),
      accessRemoveOne: AccessTC.getResolver("removeOne")
    })
  })
});

const schema = GQC.buildSchema();

export default schema;
