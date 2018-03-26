import { createIndices } from "./utils";
import { connect, close } from "@capsid/mongo/utils";

import { Project } from "@capsid/mongo/schema/projects";
import { Sample } from "@capsid/mongo/schema/samples";
import { Alignment } from "@capsid/mongo/schema/alignments";
import { MappedRead } from "@capsid/mongo/schema/mappedReads";
import { Genome } from "@capsid/mongo/schema/genomes";
import { Statistics } from "@capsid/mongo/schema/statistics";

const models = [Project, Sample, Alignment, MappedRead, Genome, Statistics];

const main = async () => {
  await connect();

  await createIndices(+process.env.WIPE);

  const filter = process.env.MODELS && process.env.MODELS.split(",");

  await Promise.all(
    models
      .map(Model => ({ name: Model.collection.name, Model }))
      .filter(({ name }) => !filter || filter.includes(name))
      .map(async ({ name, Model }) => {
        console.log(`Indexing model ${name}`);

        Model.on("es-bulk-error", err => {
          console.error(`${name} error: `);
          console.error(err);
        });

        await Model.esSynchronize();

        console.log(`Model ${name} indexed`);
      })
  );

  close();
};

main();
