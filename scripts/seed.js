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
  label: { faker: "lorem.word" },
  version: { faker: 'random.number({"min": 1, "max": 10})' },
  wikiLink: { values: ["http://google.com"] },
  name: { faker: "lorem.word" }
};

const sampleSeedConfig = {
  id: { chance: "guid" },
  source: { faker: "lorem.word" },
  role: { values: ["admin", "owner"] },
  description: { faker: "lorem.sentence" },
  cancer: { values: ["typeA", "typeB", "typeC"] },
  version: { faker: 'random.number({"min": 3, "max": 7})' },
  name: { faker: "lorem.word" }
};

const generateData = () => {
  return mocker()
    .schema("projects", projectSeedConfig, 10)
    .schema("samples", sampleSeedConfig, { min: 1, max: 10 })
    .build();
};

const deleteAll = async () => {
  const projects = await Project.find({});
  const samples = await Sample.find({});
  await Promise.all(
    [...projects, ...samples].map(
      x =>
        new Promise((resolve, reject) => {
          x.remove(e => {
            x.on("es-removed", (e, r) => {
              if (e) console.error(e);
              resolve(r);
            });
          });
        })
    )
  );
};

const saveAndIndexAll = async models =>
  Promise.all(
    models.map(
      x =>
        new Promise((resolve, reject) => {
          x.save(e => {
            x.on("es-indexed", (e, r) => {
              if (e) console.error(e);
              resolve(r);
            });
          });
        })
    )
  );

const main = async () => {
  mongoose.connect(process.env.MONGO_HOST);

  await deleteAll();

  const { projects: projectData } = await generateData();
  const projects = projectData.map(x => new Project(x));

  await saveAndIndexAll(projects);

  for (const project of projects) {
    const { samples: sampleData } = await generateData();
    const samples = sampleData.map(s => new Sample(s));
    samples.forEach(s => {
      s.projectLabel = project.label;
      s.projectId = project._id;
    });
    await saveAndIndexAll(samples);
  }

  console.log("Database seeded");

  mongoose.connection.close();
};

main();
