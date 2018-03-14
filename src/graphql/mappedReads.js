import composeWithMongoose from "graphql-compose-mongoose";

import { addFromMongoRelation } from "@capsid/graphql/utils";
import { MappedRead } from "@capsid/mongo/schema/mappedReads";
import MappedReadEsTC from "@capsid/es/schema/mappedReads";
import { ProjectTC } from "@capsid/graphql/projects";
import { SampleTC } from "@capsid/graphql/samples";
import { AlignmentTC } from "@capsid/graphql/alignments";

export const MappedReadTC = composeWithMongoose(MappedRead);

MappedReadTC.addRelation("project_", {
  resolver: () => ProjectTC.getResolver("findById"),
  prepareArgs: { _id: x => x.projectId },
  projection: { projectId: true }
});

MappedReadTC.addRelation("sample_", {
  resolver: () => SampleTC.getResolver("findById"),
  prepareArgs: { _id: x => x.sampleId },
  projection: { sampleId: true }
});

MappedReadTC.addRelation("alignment_", {
  resolver: () => AlignmentTC.getResolver("findById"),
  prepareArgs: { _id: x => x.alignmentId },
  projection: { alignmentId: true }
});

addFromMongoRelation({ elasticTC: MappedReadEsTC, mongoTC: MappedReadTC });
