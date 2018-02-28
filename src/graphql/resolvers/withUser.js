const withUser = resolvers =>
  Object.keys(resolvers).reduce(
    (obj, k) => ({
      ...obj,
      [k]: resolvers[k].wrapResolve(next => async rp => {
        const { context: { user } } = rp;
        if (!user) throw new Error("User not found");
        return next(rp);
      })
    }),
    {}
  );

export default withUser;
