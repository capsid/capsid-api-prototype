import validator from "validator";

import { Access } from "@capsid/mongo/schema/access";
import { Project } from "@capsid/mongo/schema/projects";
import { User } from "@capsid/mongo/schema/users";
import { info } from "@capsid/services/logger";

const arrayToStackMap = arr =>
  arr.reduce((obj, x, i) => ({ ...obj, [x]: arr.slice(0, i + 1) }), {});

const accessMap = arrayToStackMap(["read", "write", "admin"]);

const accessAdd = async ({ args, context }) => {
  const { projectId, userEmail: email, access: accessKey } = args;
  const access = accessMap[accessKey];

  if (!access) throw new Error(`access:Select a role`);
  if (!email || !validator.isEmail(email))
    throw new Error(`userEmail:Invalid email address`);

  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email, superUser: false });

  let existingAccess = await Access.findOne({ userId: user._id, projectId });
  if (existingAccess) {
    throw new Error(`userEmail:User "${user.email}" already has access`);
  }

  const project = await Project.findById(projectId);
  const result = await Access.create({
    projectId: project._id,
    projectLabel: project.label,
    userId: user._id,
    userEmail: user.email,
    access
  });
  info(
    `Added '${access}' user '${user.email}' to project '${project._id}'`,
    `accessAdd`
  );
  return result;
};

export default accessAdd;
