import client from "@capsid/es/client";
import { aggsToEs } from "@capsid/graphql/resolvers/utils";

const handleResult = ({ entity, reject, resolve }) => (err, response) => {
  if (err) return reject(err);
  const hits = response.hits.hits.map(x => x._source);
  resolve({
    entity,
    hits,
    total: response.hits.total,
    aggs: response.aggregations,
    endCursor: response._scroll_id
  });
};

export default ({
  entity,
  field,
  ids,
  sqon,
  aggs,
  index,
  size,
  sort,
  scrollId
}) =>
  new Promise(
    (resolve, reject) =>
      scrollId
        ? client.scroll({ scroll: "30m", scrollId }, handleResult)
        : client.search(
            {
              index,
              type: "_doc",
              sort: sort?.map(x => x.split("__").join(":")) || ["_id"],
              ...(size ? { scroll: "30m" } : null),
              size: size || 0,
              body: {
                query: {
                  terms: { [field || "_id"]: ids }
                },
                ...(aggs && { aggs: aggsToEs({ sqon, aggs }) })
              }
            },
            handleResult({ entity, reject, resolve })
          )
  );
