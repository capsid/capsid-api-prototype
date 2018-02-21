import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import { addFromMongoRelation } from "@capsid/graphql/utils";
import { Sample } from "@capsid/mongo/schema/samples";
import SampleEsTC from "@capsid/es/schema/samples";
import { ProjectTC } from "@capsid/graphql/projects";

export const SampleTC = composeWithMongoose(Sample);

SampleTC.addRelation("project", {
  resolver: () => ProjectTC.getResolver("findById"),
  prepareArgs: { _id: x => x.projectId },
  projection: { projectId: true }
});

addFromMongoRelation({ elasticTC: SampleEsTC, mongoTC: SampleTC });
