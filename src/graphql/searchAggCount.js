import { TypeComposer } from "graphql-compose";

import { searchAggCount } from "@capsid/graphql/resolvers";

export const SearchAggCountTC = TypeComposer.create(`type SearchAggCount`);
SearchAggCountTC.addFields({ aggs: { type: "JSON" } });
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
