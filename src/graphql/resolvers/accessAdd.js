import validator from "validator";

import { Access } from "@capsid/mongo/schema/access";
import { Project } from "@capsid/mongo/schema/projects";
import { User } from "@capsid/mongo/schema/users";

const arrayToStackMap = arr =>
  arr.reduce((obj, x, i) => ({ ...obj, [x]: arr.slice(0, i + 1) }), {});

const accessMap = arrayToStackMap(["read", "write", "admin"]);

const accessAdd = async ({ args, context }) => {
  const { projectId, userEmail: email, access: accessKey } = args;
  const access = accessMap[accessKey];

  if (!access) throw new Error(`Invalid role`);
  if (!email || !validator.isEmail(email))
    throw new Error(`Invalid email address`);

  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email, superUser: false });

  let existingAccess = await Access.findOne({ userId: user._id, projectId });
  if (existingAccess) {
    throw new Error(`User "${user.email}" already has access`);
  }

  // TODO: validation

  const project = await Project.findById(projectId);
  return await Access.create({
    projectId: project._id,
    projectLabel: project.label,
    userId: user._id,
    userEmail: user.email,
    access
  });
};

export default accessAdd;
