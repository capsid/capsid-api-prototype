import { TypeComposer } from "graphql-compose";

import { searchAggCount } from "@capsid/graphql/resolvers";

export const SearchAggCountTC = TypeComposer.create(`type SearchAggCount`);
SearchAggCountTC.addFields({ buckets: { type: "JSON" } });
SearchAggCountTC.addResolver({
  name: "searchAggCount",
  kind: "query",
  args: {
    query: "String!",
    aggs: "String!",
    agg: "String!"
  },
  type: SearchAggCountTC,
  resolve: searchAggCount
});
