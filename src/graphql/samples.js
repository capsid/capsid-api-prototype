import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import { Sample } from "@capsid/mongo/schema/samples";
import SampleEsTC from "@capsid/es/schema/samples";

export const SampleTC = composeWithMongoose(Sample);

SampleEsTC.getResolver("searchConnection")
  .getTypeComposer()
  .getFieldTC("edges")
  .getFieldTC("node")
  .addRelation("fromMongo", {
    resolver: () => SampleTC.getResolver("findById"),
    prepareArgs: {
      _id: source => source._id
    },
    projection: { _id: true }
  });
