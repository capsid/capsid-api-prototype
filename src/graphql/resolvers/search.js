import {
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType
} from "graphql-parse-resolve-info";

import client from "@capsid/es/client";
import { MappedRead } from "@capsid/mongo/schema/mappedReads";
import { splitSqon, aggsToEs, sqonToEs } from "@capsid/graphql/resolvers/utils";
import { index as projectIndex } from "@capsid/mongo/schema/projects";
import { index as alignmentIndex } from "@capsid/mongo/schema/alignments";
import { index as sampleIndex } from "@capsid/mongo/schema/samples";
import { index as genomeIndex } from "@capsid/mongo/schema/genomes";

const testSqon = {
  content: [
    // {
    //   content: {
    //     field: "sample.name",
    //     value: ["enim"]
    //   },
    //   op: "in"
    // },
    {
      content: {
        field: "sample.version",
        value: 5
      },
      op: ">="
    },
    {
      content: {
        field: "sample.version",
        value: 6
      },
      op: "<="
    },
    {
      content: {
        field: "genome.length",
        value: 3000
      },
      op: ">="
    }
    // {
    //   content: {
    //     fields: ["genome.accession", "genome.organism"],
    //     value: "accusamus"
    //   },
    //   op: "filter"
    // }
  ],
  op: "and"
};

const testAggs = {
  sample: [
    { field: "version", type: "stats" },
    { field: "cancer", type: "terms" }
  ],
  genome: [{ field: "length", type: "stats" }]
};

const entities = [
  {
    name: "sample",
    typeName: "SampleSearch",
    mappedReadField: "sampleId",
    index: sampleIndex
  },
  {
    name: "genome",
    typeName: "GenomeSearch",
    field: "gi",
    mappedReadField: "genome",
    index: genomeIndex
  },
  {
    name: "project",
    typeName: "ProjectSearch",
    mappedReadField: "projectId",
    index: projectIndex
  },
  {
    name: "alignment",
    typeName: "AlignmentSearch",
    mappedReadField: "alignmentId",
    index: alignmentIndex
  }
];

const queryEntityIds = (entities, sqonEntityMap) =>
  Promise.all(
    entities.map(
      ({ name, field, index }) =>
        new Promise((resolve, reject) => {
          const fetchMore = (results = []) => (err, response) => {
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
          const esQuery = sqonToEs(sqonEntityMap[name]);
          client.search(
            {
              index,
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
                ...(esQuery && { query: esQuery })
              }
            },
            fetchMore()
          );
        })
    )
  );

export default async ({
  args: { query, aggs },
  info,
  fieldInfo = parseResolveInfo(info),
  sqon = JSON.parse(query)
}) => {
  sqon = testSqon;
  aggs = testAggs;

  const entityIds = await queryEntityIds(entities, splitSqon(sqon));

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
                    ...(hitsField ? { scroll: "30m" } : null),
                    size: hitsField ? hitsArgs.size : 0,
                    sort: hitsArgs.sort || ["_id"],
                    body: {
                      query: {
                        terms: {
                          [field || "_id"]: uniqueMatchingReads.aggregations[
                            name
                          ].buckets.map(({ key }) => key)
                        }
                      },
                      ...(aggs[name] && { aggs: aggsToEs(aggs[name]) })
                    }
                  },
                  handleResult
                );
          })
      )
  );

  return results.reduce((obj, { name, ...x }) => ({ ...obj, [name]: x }), {});
};
