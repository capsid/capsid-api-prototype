import mongoose from "mongoose";
import composeWithMongoose from "graphql-compose-mongoose";

import { Project } from "@capsid/mongo/schema/projects";
import { Access } from "@capsid/mongo/schema/access";
import { User } from "@capsid/mongo/schema/users";

export const AccessTC = composeWithMongoose(Access);

const arrayToStackMap = arr =>
  arr.reduce((obj, x, i) => ({ ...obj, [x]: arr.slice(0, i + 1) }), {});

const accessMap = arrayToStackMap(["read", "write", "admin"]);

AccessTC.addResolver({
  name: "accessAdd",
  kind: "mutation",
  args: {
    projectId: "String!",
    userEmail: "String!",
    access: "String!"
  },
  type: AccessTC,
  resolve: async ({ args, context }) => {
    const { projectId, userEmail: email, access } = args;
    const { user: adminUser } = context;

    const userAccess = await Access.findOne({
      userId: adminUser._id,
      projectId
    });
    if (!adminUser.superUser && !userAccess.access.includes("admin")) {
      throw new Error(
        `User "${
          adminUser.email
        }" does not have permission to add a user to project ${projectId}`
      );
    }

    let user = await User.findOne({ email });
    if (!user) user = await User.create({ email, superUser: false });

    let existingAccess = await Access.findOne({ userId: user._id, projectId });
    if (existingAccess) {
      throw new Error(
        `User "${user.email}" already has access to project ${projectId}`
      );
    }

    // TODO: validation

    const project = await Project.findById(projectId);
    return await Access.create({
      projectId: project._id,
      projectLabel: project.label,
      userId: user._id,
      userEmail: user.email,
      access: accessMap[access]
    });
  }
});
