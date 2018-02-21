import _ from "lodash";
import mocker from "mocker-data-generator";
import mongoose from "mongoose";

import client from "@capsid/es/client";
import { Project } from "@capsid/mongo/schema/projects";
import { Sample } from "@capsid/mongo/schema/samples";
import { Alignment } from "@capsid/mongo/schema/alignments";

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

const alignmentSeedConfig = {
  id: { chance: "guid" },
  name: { faker: "lorem.word" },
  aligner: { faker: "lorem.word" },
  platform: { faker: "lorem.word" },
  type: { faker: "lorem.word" },
  version: { faker: 'random.number({"min": 3, "max": 7})' },
  infile: { values: ["C:/in/filepath"] },
  outfile: { values: ["C:/out/filepath"] }
};

const generateData = () => {
  return mocker()
    .schema("projects", projectSeedConfig, 10)
    .schema("samples", sampleSeedConfig, { min: 1, max: 10 })
    .schema("alignments", alignmentSeedConfig, { min: 1, max: 3 })
    .build();
};

const deleteAll = async () => {
  const projects = await Project.find({});
  const samples = await Sample.find({});
  const alignments = await Alignment.find({});

  for (const set of [projects, samples, alignments]) {
    await Promise.all(
      set.map(
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
  }
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

    for (const sample of samples) {
      const { alignments: alignmentData } = await generateData();
      const alignments = alignmentData.map(a => new Alignment(a));
      alignments.forEach(a => {
        a.projectLabel = sample.projectLabel;
        a.projectId = sample.projectId;
        a.sampleName = sample.name;
        a.sampleId = sample._id;
      });
      await saveAndIndexAll(alignments);
    }
  }

  console.log("Database seeded");

  mongoose.connection.close();
};

main();
