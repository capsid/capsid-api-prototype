import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import { addFromMongoRelation } from "@capsid/graphql/utils";
import { Alignment } from "@capsid/mongo/schema/alignments";
import AlignmentEsTC from "@capsid/es/schema/alignments";
import { ProjectTC } from "@capsid/graphql/projects";
import { SampleTC } from "@capsid/graphql/samples";

export const AlignmentTC = composeWithMongoose(Alignment);

AlignmentTC.addRelation("project", {
  resolver: () => ProjectTC.getResolver("findById"),
  prepareArgs: { _id: x => x.projectId },
  projection: { projectId: true }
});

AlignmentTC.addRelation("sample", {
  resolver: () => SampleTC.getResolver("findById"),
  prepareArgs: { _id: x => x.sampleId },
  projection: { sampleId: true }
});

addFromMongoRelation({ elasticTC: AlignmentEsTC, mongoTC: AlignmentTC });
