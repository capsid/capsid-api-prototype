export default ({ elasticTC, mongoTC }) => {
  elasticTC
    .getResolver("searchConnection")
    .getTypeComposer()
    .getFieldTC("edges")
    .getFieldTC("node")
    .addRelation("fromMongo", {
      resolver: () => mongoTC.getResolver("findById"),
      prepareArgs: {
        _id: source => source._id
      },
      projection: { _id: true }
    });
};
