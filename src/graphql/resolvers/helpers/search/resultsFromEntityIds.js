import client from "@capsid/es/client";
import { aggsToEs } from "@capsid/graphql/resolvers/utils";

const handleResult = ({ name, reject, resolve }) => (err, response) => {
  if (err) return reject(err);
  const hits = response.hits.hits.map(x => x._source);
  resolve({
    name,
    hits,
    total: response.hits.total,
    aggs: response.aggregations,
    endCursor: response._scroll_id
  });
};

export default ({
  name,
  field,
  ids,
  sqon,
  aggs,
  index,
  size,
  sort,
  scrollId,
  query
}) =>
  new Promise(
    (resolve, reject) =>
      scrollId
        ? client.scroll(
            { scroll: "30m", scrollId },
            handleResult({ name, reject, resolve })
          )
        : client.search(
            {
              index,
              type: "_doc",
              sort: sort?.map(x => x.split("__").join(":")) || ["_id"],
              ...(size && { scroll: "30m" }),
              size: size || 0,
              body: {
                query: { ...(query || { terms: { [field || "_id"]: ids } }) },
                ...(aggs && { aggs: aggsToEs({ sqon, aggs }) })
              }
            },
            handleResult({ name, reject, resolve })
          )
  );
