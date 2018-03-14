import composeWithMongoose from "graphql-compose-mongoose";

import { User } from "@capsid/mongo/schema/users";

export const UserTC = composeWithMongoose(User);
