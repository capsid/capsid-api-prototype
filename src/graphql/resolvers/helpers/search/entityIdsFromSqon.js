import client from "@capsid/es/client";
import { sqonToEs } from "@capsid/graphql/resolvers/utils";
import { Access } from "@capsid/mongo/schema/access";

export default async ({ entities, sqonByEntity, user }) => {
  const userScope = !user.superUser && {
    projectId: (await Access.find({ userId: user.id })).map(x => x.projectId)
  };
  return Promise.all(
    entities.map(
      ({ name, field, index, scope, ...rest }) =>
        new Promise((resolve, reject) => {
          const fetchMore = (results = []) => (err, response) => {
            if (err) return reject(err);
            const nextResults = [
              ...results,
              ...response.hits.hits
                .map(x => x[field ? "_source" : "_id"])
                .map(x => (field ? x[field] : x))
            ];
            if (nextResults.length === response.hits.total)
              resolve({
                ...rest,
                name,
                field,
                index,
                scope,
                results: nextResults
              });
            else
              client.scroll(
                { scroll: "2s", scrollId: response._scroll_id },
                fetchMore(nextResults, resolve)
              );
          };
          const sqonQuery = sqonToEs(sqonByEntity[name]);
          client.search(
            {
              index,
              type: "_doc",
              scroll: "2s",
              size: 500,
              sort: ["_id"],
              ...(field
                ? { _source: [field] }
                : {
                    stored_fields: "_none",
                    docvalue_fields: ["_uid"]
                  }),
              body: {
                query: {
                  bool: {
                    must: [
                      ...(scope && userScope
                        ? Object.keys(scope).map(k => ({
                            terms: { [scope[k]]: userScope[k] }
                          }))
                        : []),
                      ...(sqonQuery ? [{ ...sqonQuery }] : [])
                    ]
                  }
                }
              }
            },
            fetchMore()
          );
        })
    )
  );
};
