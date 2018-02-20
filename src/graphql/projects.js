import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import ProjectsSchema from "@capsid/mongo/schema/projects";
import ProjectsEsTC from "@capsid/es/schema/projects";

export const Projects = mongoose.model("Projects", ProjectsSchema);
export const ProjectsTC = composeWithMongoose(Projects);
ProjectsEsTC.getResolver("search")
  .getTypeComposer()
  .getFieldTC("hits")
  .addRelation("fromMongo", {
    resolver: () => ProjectsTC.getResolver("findById"),
    prepareArgs: {
      _id: source => source._id
    },
    projection: { _id: true }
  });
