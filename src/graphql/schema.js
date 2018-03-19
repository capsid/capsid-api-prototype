import { GQC } from "graphql-compose";

import { ProjectTC } from "@capsid/graphql/projects";
import { SampleTC } from "@capsid/graphql/samples";
import { AlignmentTC } from "@capsid/graphql/alignments";
import { GenomeTC } from "@capsid/graphql/genomes";
import { AccessTC } from "@capsid/graphql/access";
import { LoginTC } from "@capsid/graphql/login";
import { SearchTC } from "@capsid/graphql/search";
import { SearchAggCountTC } from "@capsid/graphql/searchAggCount";

import { withUser, withProjectAdminAccess } from "@capsid/graphql/resolvers";

GQC.rootQuery().addFields({
  login: LoginTC.getResolver("login"),

  ...withUser({
    search: SearchTC.getResolver("search"),
    searchAggCount: SearchAggCountTC.getResolver("searchAggCount"),

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
