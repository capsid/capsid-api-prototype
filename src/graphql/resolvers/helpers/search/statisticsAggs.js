import resultsFromEntityIds from "./resultsFromEntityIds";

export default ({ idMap, sqonByEntity, aggs }) =>
  resultsFromEntityIds({
    name: "statistics",
    query: {
      bool: {
        should: ["projects", "samples", "alignments"].map(x => ({
          bool: {
            must: [
              { term: { ownerType: x.slice(0, -1) } },
              { terms: { ownerId: idMap[x] } },
              { terms: { gi: idMap["genomes"] } }
            ]
          }
        }))
      }
    },
    sqon: sqonByEntity.statistics,
    aggs: aggs.statistics,
    index: "statistics"
  });
