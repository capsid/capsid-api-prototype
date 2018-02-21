import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import { addFromMongoRelation } from "@capsid/graphql/utils";
import { Project } from "@capsid/mongo/schema/projects";
import ProjectsEsTC from "@capsid/es/schema/projects";

export const ProjectTC = composeWithMongoose(Project);

addFromMongoRelation({ elasticTC: ProjectsEsTC, mongoTC: ProjectTC });
