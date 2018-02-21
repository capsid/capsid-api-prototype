import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import { addFromMongoRelation } from "@capsid/graphql/utils";
import { Sample } from "@capsid/mongo/schema/samples";
import SampleEsTC from "@capsid/es/schema/samples";

export const SampleTC = composeWithMongoose(Sample);
addFromMongoRelation({ elasticTC: SampleEsTC, mongoTC: SampleTC })
