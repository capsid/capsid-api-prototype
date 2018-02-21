import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import { addFromMongoRelation } from "@capsid/graphql/utils";
import { Project } from "@capsid/mongo/schema/projects";
import ProjectEsTC from "@capsid/es/schema/projects";
import { SampleTC } from "@capsid/graphql/samples";

export const ProjectTC = composeWithMongoose(Project);

addFromMongoRelation({ elasticTC: ProjectEsTC, mongoTC: ProjectTC });
