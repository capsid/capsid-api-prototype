import _ from "lodash";
import mocker from "mocker-data-generator";
import mongoose from "mongoose";

import client from "@capsid/es/client";
import { Project } from "@capsid/mongo/schema/projects";
import { Sample } from "@capsid/mongo/schema/samples";

const projectSeedConfig = {
  id: { chance: "guid" },
  description: { faker: "lorem.sentence" },
  roles: { function: () => ["admin", "owner"] },
  label: { values: ["label", "not label", "another"] },
  version: { faker: 'random.number({"min": 1, "max": 10})' },
  wikiLink: { values: ["http://google.com"] },
  name: { faker: "lorem.word" }
};

const sampleSeedConfig = {
  id: { chance: "guid" },
  source: { faker: "lorem.word" },
  projectLabel: { values: ["label", "not label", "another"] },
  role: { values: ["admin", "owner"] },
  description: { faker: "lorem.sentence" },
  cancer: { values: ["typeA", "typeB", "typeC"] },
  version: { faker: 'random.number({"min": 3, "max": 7})' },
  name: { faker: "lorem.word" }

const generateData = () => {
  return mocker()
    .schema("projects", projectSeedConfig, 50)
    .schema("samples", sampleSeedConfig, 50)
    .build();
};

const deleteAll = async () => {
  const projects = await Project.find({});
  await Promise.all(projects.map(x => x.remove()));

  const samples = await Sample.find({});
  return Promise.all(samples.map(x => x.remove()));
};

const main = async () => {
  mongoose.connect(process.env.MONGO_HOST);

  await deleteAll();

  const { projects, samples } = await generateData();

  await Promise.all(projects.map(x => new Project(x)).map(x => x.save()));
  await Promise.all(samples.map(x => new Sample(x)).map(x => x.save()));

  console.log("Database seeded");

  mongoose.connection.close();
};

main();
