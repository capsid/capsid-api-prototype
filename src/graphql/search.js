import { TypeComposer } from "graphql-compose";

import SampleEsTC from "@capsid/es/schema/samples";
import GenomeEsTC from "@capsid/es/schema/genomes";
import ProjectEsTC from "@capsid/es/schema/projects";
import AlignmentEsTC from "@capsid/es/schema/alignments";
import { search } from "@capsid/graphql/resolvers";

const fields = tc => {
  const newType = tc.clone(`${tc.getTypeName()}Search`);
  newType.addFields({
    statistics: { type: "JSON" },
    counts: { type: "JSON" },
    cacheId: { type: "String" }
  });
  return {
    aggs: { type: "JSON" },
    hits: {
      type: [newType],
      args: { size: "Int", after: "String", sort: ["String"] }
    },
    total: { type: "Int" },
    endCursor: { type: "String" },
    hasStatistics: { type: "Boolean" }
  };
};

const SampleSearchTC = TypeComposer.create(`type SampleSearch`);
SampleSearchTC.addFields(fields(SampleEsTC));

const GenomeSearchTC = TypeComposer.create(`type GenomeSearch`);
GenomeSearchTC.addFields(fields(GenomeEsTC));

const ProjectSearchTC = TypeComposer.create(`type ProjectSearch`);
ProjectSearchTC.addFields(fields(ProjectEsTC));

const AlignmentSearchTC = TypeComposer.create(`type AlignmentSearch`);
AlignmentSearchTC.addFields(fields(AlignmentEsTC));

const StatisticsSearchTC = TypeComposer.create(`type StatisticsSearch`);
StatisticsSearchTC.addFields({ aggs: { type: "JSON" } });

export const SearchTC = TypeComposer.create(`type Search`);
SearchTC.addFields({
  samples: SampleSearchTC,
  genomes: GenomeSearchTC,
  projects: ProjectSearchTC,
  alignments: AlignmentSearchTC,
  statistics: StatisticsSearchTC
});

SearchTC.addResolver({
  name: "search",
  kind: "query",
  args: {
    query: "String!",
    aggs: "String!"
  },
  type: SearchTC,
  resolve: search
});
