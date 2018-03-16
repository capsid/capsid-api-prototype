import mongoose from "mongoose";

import { createIndices } from "./utils";

import { Project } from "@capsid/mongo/schema/projects";
import { Sample } from "@capsid/mongo/schema/samples";
import { Alignment } from "@capsid/mongo/schema/alignments";
import { MappedRead } from "@capsid/mongo/schema/mappedReads";
import { Genome } from "@capsid/mongo/schema/genomes";
import { Statistics } from "@capsid/mongo/schema/statistics";

const models = [Project, Sample, Alignment, MappedRead, Genome, Statistics];

const main = async () => {
  mongoose.connect(process.env.MONGO_HOST);

  await createIndices(false);
  models.map(Model => Model.on("es-bulk-error", err => console.error(err)));
  await Promise.all(models.map(Model => Model.esSynchronize()));

  mongoose.connection.close();
};

main();
