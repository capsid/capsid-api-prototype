import {
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType
} from "graphql-parse-resolve-info";

import client from "@capsid/es/client";
import { Access } from "@capsid/mongo/schema/access";
import { MappedRead } from "@capsid/mongo/schema/mappedReads";
import { splitSqon, aggsToEs, sqonToEs } from "@capsid/graphql/resolvers/utils";
import { index as projectIndex } from "@capsid/mongo/schema/projects";
import { index as alignmentIndex } from "@capsid/mongo/schema/alignments";
import { index as sampleIndex } from "@capsid/mongo/schema/samples";
import { index as genomeIndex } from "@capsid/mongo/schema/genomes";

const entities = [
  {
    name: "samples",
    typeName: "SampleSearch",
    mappedReadField: "sampleId",
    index: sampleIndex,
    scope: { projectId: "projectId" }
  },
  {
    name: "genomes",
    typeName: "GenomeSearch",
    field: "gi",
    mappedReadField: "genome",
    index: genomeIndex
  },
  {
    name: "projects",
    typeName: "ProjectSearch",
    mappedReadField: "projectId",
    index: projectIndex,
    scope: { projectId: "_id" }
  },
  {
    name: "alignments",
    typeName: "AlignmentSearch",
    mappedReadField: "alignmentId",
    index: alignmentIndex,
    scope: { projectId: "projectId" }
  }
];

const queryEntityIds = (entities, sqonEntityMap, userScope) =>
  Promise.all(
    entities.map(
      ({ name, field, index, scope }) =>
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
              resolve({ name, results: nextResults });
            else
              client.scroll(
                { scroll: "2s", scrollId: response._scroll_id },
                fetchMore(nextResults, resolve)
              );
          };
          const sqonQuery = sqonToEs(sqonEntityMap[name]);
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

export default async ({
  context: { user },
  args,
  info,
  fieldInfo = parseResolveInfo(info),
  sqon = JSON.parse(args.query),
  aggs = JSON.parse(args.aggs)
}) => {
  const entityIds = await queryEntityIds(
    entities,
    splitSqon(sqon),
    !user.superUser && {
      projectId: (await Access.find({ userId: user.id })).map(x => x.projectId)
    }
  );

  const uniqueMatchingReads = await MappedRead.esSearch({
    size: 0,
    query: {
      bool: {
        must: entityIds.map(
          ({
            name,
            results,
            field = entities.find(x => x.name === name).mappedReadField
          }) => ({
            terms: { [field]: results }
          })
        )
      }
    },
    aggs: entities.reduce(
      (obj, x) => ({
        ...obj,
        [x.name]: { terms: { field: x.mappedReadField, size: 999999 } }
      }),
      {}
    )
  });

  const results = await Promise.all(
    entities
      .map(x => ({
        ...x,
        gqlFields:
          fieldInfo.fieldsByTypeName.Search[x.name]?.fieldsByTypeName[
            x.typeName
          ]
      }))
      .filter(({ gqlFields }) => !!gqlFields)
      .map(
        ({ name, field, index, gqlFields }) =>
          new Promise((resolve, reject) => {
            const handleResult = (err, response) => {
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
            const hitsField = gqlFields.hits;
            const hitsArgs = hitsField?.args || {};
            hitsArgs.after
              ? client.scroll(
                  { scroll: "30m", scrollId: hitsArgs.after },
                  handleResult
                )
              : client.search(
                  {
                    index,
                    type: "_doc",
                    sort: hitsArgs.sort?.map(x => x.split("__").join(":")) || [
                      "_id"
                    ],
                    ...(hitsField ? { scroll: "30m" } : null),
                    size: hitsField ? hitsArgs.size : 0,
                    body: {
                      query: {
                        terms: {
                          [field || "_id"]: uniqueMatchingReads.aggregations[
                            name
                          ].buckets.map(({ key }) => key)
                        }
                      },
                      ...(aggs[name] && {
                        aggs: aggsToEs({
                          sqon: splitSqon(sqon)[name],
                          aggs: aggs[name]
                        })
                      })
                    }
                  },
                  handleResult
                );
          })
      )
  );

  return results.reduce((obj, { name, ...x }) => ({ ...obj, [name]: x }), {});
};
