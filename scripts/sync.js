import mongoose from "mongoose";
import fs from "fs";

import { createIndices } from "./utils";
import { connect, close } from "@capsid/mongo/utils";

import { Project } from "@capsid/mongo/schema/projects";
import { Sample } from "@capsid/mongo/schema/samples";
import { Alignment } from "@capsid/mongo/schema/alignments";
import { MappedRead } from "@capsid/mongo/schema/mappedReads";
import { Genome } from "@capsid/mongo/schema/genomes";
import { Statistics } from "@capsid/mongo/schema/statistics";

const models = [Project, Sample, Alignment, MappedRead, Genome, Statistics];

const anchorFromName = name => `${name}.anchor`;

const main = async () => {
  await connect();

  await createIndices(+process.env.WIPE);

  const filter = process.env.MODELS && process.env.MODELS.split(",");

  await Promise.all(
    models
      .map(Model => ({
        name: Model.collection.name,
        anchor: anchorFromName(Model.collection.name),
        Model
      }))
      .filter(({ name }) => !filter || filter.includes(name))
      .map(x => ({
        ...x,
        query: fs.existsSync(x.anchor)
          ? {
              _id: {
                // eslint-disable-next-line
                $gte: mongoose.Types.ObjectId(
                  fs.readFileSync(x.anchor, { encoding: "utf8" })
                )
              }
            }
          : {}
      }))
      .map(async ({ name, Model, query, anchor }) => {
        const count = await Model.count(query);

        console.log(
          `Indexing model ${name}, count: ${count} query: ${JSON.stringify(
            query
          )}`
        );

        let docCount = 0;
        Model.on("es-bulk-data", doc => {
          if (docCount++ >= 10000) {
            console.log(`Writing ${name} anchor '${doc._id}'`);
            fs.writeFile(anchor, `${doc._id}`, () => {});
            docCount = 0;
          }
        });

        Model.on("es-bulk-error", err => {
          console.error(`${name} error: `);
          console.error(err);
        });

        await Model.esSynchronize({ $query: query, $orderBy: { _id: 1 } });

        console.log(`Model ${name} indexed`);
      })
  );

  close();
};

main();
