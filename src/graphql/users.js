import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import { addFromMongoRelation } from "@capsid/graphql/utils";
import { User } from "@capsid/mongo/schema/users";
import { AccessTC } from "@capsid/graphql/access";

export const UserTC = composeWithMongoose(User);
