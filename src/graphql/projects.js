import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import { Project } from "@capsid/mongo/schema/projects";
import ProjectsEsTC from "@capsid/es/schema/projects";

export const ProjectTC = composeWithMongoose(Project);

ProjectsEsTC.getResolver("searchConnection")
  .getTypeComposer()
  .getFieldTC("edges")
  .getFieldTC("node")
  .addRelation("fromMongo", {
    resolver: () => ProjectTC.getResolver("findById"),
    prepareArgs: {
      _id: source => source._id
    },
    projection: { _id: true }
  });
