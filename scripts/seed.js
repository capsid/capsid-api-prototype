import _ from "lodash";
import mocker from "mocker-data-generator";
import mongoose from "mongoose";

import client from "@capsid/es/client";
import { Project } from "@capsid/mongo/schema/projects";
import { Sample } from "@capsid/mongo/schema/samples";
import { Alignment } from "@capsid/mongo/schema/alignments";
import { MappedRead } from "@capsid/mongo/schema/mappedReads";

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

const mappedReadConfig = {
  id: { chance: "guid" },
  refStart: { faker: 'random.number({"min": 10, "max": 100})' },
  refEnd: { faker: 'random.number({"min": 300, "max": 1000})' },
  sequence: { faker: "lorem.word" },
  pg: { faker: "lorem.word" },
  readId: { chance: "guid" },
  platform: { values: ["Platform1", "Platform2"] },
  mapq: { faker: 'random.number({"min": 10, "max": 100})' },
  pairEnd: { values: [0] },
  minQual: { faker: 'random.number({"min": 1, "max": 10})' },
  genome: { faker: 'random.number({"min": 100, "max": 200})' },
  md: { chance: "guid" },
  cigar: { values: [[0, 65], [100, 200], [203, 300]] },
  mismatch: { faker: 'random.number({"min": 5, "max": 15})' },
  miscalls: { values: [0] },
  readLength: { faker: 'random.number({"min": 50, "max": 100})' },
  alignScore: { faker: 'random.number({"min": 100, "max": 1000})' },
  mapsGene: [{ chance: "guid", length: 3 }],
  qqual: { chance: "guid" },
  refStrand: { values: [1] },
  alignLength: { faker: 'random.number({"min": 20, "max": 200})' },
  sequencingType: { values: ["TYPE 1", "TYPE 2", "TYPE 3"] },
  alignLength: { faker: 'random.number({"min": 20, "max": 70})' },
  isRef: { values: [true, false] }
};

const generateData = () => {
  return mocker()
    .schema("projects", projectSeedConfig, 10)
    .schema("samples", sampleSeedConfig, { min: 1, max: 10 })
    .schema("alignments", alignmentSeedConfig, { min: 1, max: 3 })
    .schema("mappedReads", mappedReadConfig, { min: 10, max: 40 })
    .build();
};

const deleteAll = async () => {
  let batch;
  const pageSize = 100;
  for (const model of [Project, Sample, Alignment, MappedRead]) {
    while ((batch = await model.find().limit(pageSize)).length) {
      await Promise.all(
        batch.map(
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

      for (const alignment of alignments) {
        const { mappedReads: mappedReadData } = await generateData();
        const mappedReads = mappedReadData.map(m => new MappedRead(m));
        mappedReads.forEach(m => {
          m.projectLabel = alignment.projectLabel;
          m.projectId = alignment.projectId;
          m.sampleName = alignment.sampleName;
          m.sampleId = alignment.sampleId;
          m.alignmentName = alignment.name;
          m.alignmentId = alignment._id;
        });
        await saveAndIndexAll(mappedReads);
      }
    }
  }

  console.log("Database seeded");

  mongoose.connection.close();
};

main();
