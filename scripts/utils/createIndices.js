import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import client from "@capsid/es/client";

import projects, { index as projectIndex } from "@capsid/mongo/schema/projects";
import samples, { index as sampleIndex } from "@capsid/mongo/schema/samples";
import alignments, {
  index as alignmentIndex
} from "@capsid/mongo/schema/alignments";
import genomes, { index as genomeIndex } from "@capsid/mongo/schema/genomes";
import mapped, { index as mappedIndex } from "@capsid/mongo/schema/mappedReads";
import statistics, {
  index as statisticsIndex
} from "@capsid/mongo/schema/statistics";

import { addMultiFieldsToMapping } from "@capsid/es/schema/utils";

const mappings = {
  [projectIndex]: projects,
  [sampleIndex]: samples,
  [alignmentIndex]: alignments,
  [genomeIndex]: genomes,
  [mappedIndex]: mapped,
  [statisticsIndex]: statistics
};

export default async () => {
  await Promise.all(
    Object.keys(mappings).map(async index => {
      if (await client.indices.exists({ index }))
        await client.indices.delete({ index });
      await client.indices.create({
        index,
        body: {
          mappings: {
            _doc: {
              properties: addMultiFieldsToMapping(generate(mappings[index]))
            }
          }
        }
      });
      console.log(`created index ${index}`);
    })
  );
};
