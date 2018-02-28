import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import { Access } from "@capsid/mongo/schema/access";
import { accessAdd } from "@capsid/graphql/resolvers";

export const AccessTC = composeWithMongoose(Access);

AccessTC.addResolver({
  name: "accessAdd",
  kind: "mutation",
  args: {
    projectId: "String!",
    userEmail: "String!",
    access: "String!"
  },
  type: AccessTC,
  resolve: accessAdd
});

AccessTC.setResolver(
  "removeOne",
  AccessTC.getResolver("removeOne").wrapResolve(next => rp => {
    const { args: { filter: { userEmail, userId } }, context: { user } } = rp;
    if (!user.superUser && (user.email === userEmail || user._id === userId))
      throw new Error(`You cannot remove yourself from a project.`);
    return next(rp);
  })
);
