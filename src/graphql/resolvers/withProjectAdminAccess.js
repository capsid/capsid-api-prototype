import { Access } from "@capsid/mongo/schema/access";

const withProjectAdminAccess = resolvers =>
  Object.keys(resolvers).reduce(
    (obj, k) => ({
      ...obj,
      [k]: resolvers[k].wrapResolve(next => async rp => {
        const { context: { user }, args: { filter, projectId } } = rp;
        const finalProjectId = projectId || filter.projectId;
        const userAccess = await Access.findOne({
          userId: user._id,
          projectId: finalProjectId
        });
        if (!user.superUser && !userAccess?.access?.includes("admin")) {
          throw new Error(
            `User "${
              user.email
            }" does not have admin access to project ${finalProjectId}`
          );
        }
        return next(rp);
      })
    }),
    {}
  );

export default withProjectAdminAccess;
