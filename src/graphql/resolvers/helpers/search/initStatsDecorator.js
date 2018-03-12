import _ from "lodash";
import { Statistics } from "@capsid/mongo/schema/statistics";

const initStatsDecorator = async ({ name, hits, idMap }) => {
  if (!hits || _.isEmpty(hits)) return null;
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

export default initStatsDecorator;
