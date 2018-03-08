import _ from "lodash";
import {
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType
} from "graphql-parse-resolve-info";

import client from "@capsid/es/client";
import { Access } from "@capsid/mongo/schema/access";
import { Statistics } from "@capsid/mongo/schema/statistics";
import { MappedRead } from "@capsid/mongo/schema/mappedReads";
import { splitSqon, aggsToEs, sqonToEs } from "@capsid/graphql/resolvers/utils";
import { index as projectIndex } from "@capsid/mongo/schema/projects";
import { index as alignmentIndex } from "@capsid/mongo/schema/alignments";
import { index as sampleIndex } from "@capsid/mongo/schema/samples";
import { index as genomeIndex } from "@capsid/mongo/schema/genomes";

const fetchEntityIds = ({ entities, sqonMap, userScope }) =>
  Promise.all(
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
          const sqonQuery = sqonToEs(sqonMap[name]);
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

const fetchResults = ({
  entities,
  aggs,
  info,
  idMap,
  sqonMap,
  fieldInfo = parseResolveInfo(info)
}) =>
  Promise.all(
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
                        terms: { [field || "_id"]: idMap[name] }
                      },
                      ...(aggs[name] && {
                        aggs: aggsToEs({
                          sqon: sqonMap[name],
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

const fetchIdMapFromReads = async ({ entitiesWithIds }) => {
  const response = await MappedRead.esSearch({
    size: 0,
    query: {
      bool: {
        must: entitiesWithIds.map(({ name, results, mappedReadField }) => ({
          terms: { [mappedReadField]: results }
        }))
      }
    },
    aggs: entitiesWithIds.reduce(
      (obj, x) => ({
        ...obj,
        [x.name]: { terms: { field: x.mappedReadField, size: 999999 } }
      }),
      {}
    )
  });
  return Object.keys(response.aggregations).reduce(
    (obj, k) => ({
      ...obj,
      [k]: response.aggregations[k].buckets.map(({ key }) => key)
    }),
    {}
  );
};

const getStatsGenerator = async ({ name, hits, idMap }) => {
  if (name === "genomes") {
    const stats = await Promise.all(
      ["projects", "samples", "alignments"].map(async x => ({
        name: x,
        stats:
          idMap[x].length > 1
            ? {}
            : (await Statistics.find({
                ownerType: x.slice(0, -1),
                ownerId: idMap[x][0],
                gi: { $in: hits.map(x => x.gi) }
              })).reduce((obj, y) => ({ ...obj, [y.gi]: y }), {})
      }))
    );
    return stats.some(y => !_.isEmpty(y.stats))
      ? hit =>
          stats
            .map(y => ({ name: y.name, value: y.stats[hit.gi] }))
            .filter(y => !_.isEmpty(y.value))
      : null;
  } else {
    const stats =
      idMap["genomes"].length === 1
        ? (await Statistics.find({
            ownerType: name.slice(0, -1),
            ownerId: { $in: hits.map(x => x.id) },
            gi: idMap["genomes"][0]
          })).reduce((obj, y) => ({ ...obj, [y.ownerId]: y }), {})
        : {};
    return !_.isEmpty(stats)
      ? hit =>
          stats[hit.id] ? [{ name: "genomes", value: stats[hit.id] }] : []
      : null;
  }
};

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

export default async ({
  context: { user },
  args,
  info,
  sqon = JSON.parse(args.query),
  aggs = JSON.parse(args.aggs),
  sqonMap = splitSqon(sqon)
}) => {
  const entitiesWithIds = await fetchEntityIds({
    entities,
    sqonMap,
    userScope: !user.superUser && {
      projectId: (await Access.find({ userId: user.id })).map(x => x.projectId)
    }
  });

  const idMap = await fetchIdMapFromReads({ entitiesWithIds });

  const results = await fetchResults({ entities, aggs, idMap, sqonMap, info });

  const decoratedResults = await Promise.all(
    results.map(async ({ name, hits, ...rest }) => {
      const statsGenerator = await getStatsGenerator({ name, hits, idMap });
      return {
        ...rest,
        name,
        hasStatistics: !!statsGenerator,
        hits: hits.map(x => ({
          ...x,
          statistics: statsGenerator?.(x) || []
        }))
      };
    })
  );

  return decoratedResults.reduce(
    (obj, { name, ...x }) => ({ ...obj, [name]: x }),
    {}
  );
};
