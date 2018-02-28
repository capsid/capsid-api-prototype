import _ from "lodash";
import mocker from "mocker-data-generator";
import mongoose from "mongoose";
import timely from "timely";

import { createIndices } from "./utils";
import { Project } from "@capsid/mongo/schema/projects";
import { Sample } from "@capsid/mongo/schema/samples";
import { Alignment } from "@capsid/mongo/schema/alignments";
import { MappedRead } from "@capsid/mongo/schema/mappedReads";
import { Genome } from "@capsid/mongo/schema/genomes";
import { User } from "@capsid/mongo/schema/users";
import { Access } from "@capsid/mongo/schema/access";

const models = [Project, Sample, Alignment, MappedRead, Genome, User, Access];

const email = process.env.SUPER_USER;

const nProjects = +process.env.N_PROJECTS || 10;
const nSamples = +process.env.N_SAMPLES || 40; // per project
const nAlignments = +process.env.N_ALIGNMENTS || 2; // per sample
const nGenomes = +process.env.N_GENOMES || 16000; // total

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

const genomeSeedConfig = {
  id: { chance: "guid" },
  name: { faker: "lorem.sentence" },
  length: { faker: 'random.number({"min": 1000, "max": 5000})' },
  organism: { faker: "lorem.sentence" },
  taxonomy: [{ faker: "lorem.word", length: 6 }],
  strand: { values: [true, false] },
  accession: { faker: "lorem.word" },
  gi: { faker: 'random.number({"min": 1000000, "max": 5000000})' },
  taxonId: { faker: 'random.number({"min": 10000, "max": 50000})' },
  version: { faker: 'random.number({"min": 0, "max": 5})' }
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

const generateData = (config, n) =>
  mocker()
    .schema("items", config, n)
    .build();

const deleteAll = async () => {
  await createIndices();
  await Promise.all(models.map(x => x.deleteMany()));
};

const saveAndIndexAll = async models => {
  const Model = models[0].constructor;
  await Model.insertMany(models);
  return Model.esSynchronize();
};

const log = (msg, timeFn) => console.log(`${timeFn.time}ms :: ${msg}`);

const generateEntities = async (parents, seedConfig, n, mapper) => {
  return _.flatten(
    await Promise.all(
      parents.map(async parent => {
        const { items } = await generateData(seedConfig, n);
        return items.map(item => mapper(item, parent));
      })
    )
  );
};

const randomInRange = (min, max) => Math.floor(Math.random() * max) + min;

const pickRandomElements = (arr, n) =>
  [...Array(n)].map(x => arr[randomInRange(0, arr.length)]);

const generateEntitiesHasMany = async (set, seedConfig, n, mapper) => {
  const { items } = await generateData(seedConfig, n);
  return items.map(item => {
    const objs = pickRandomElements(set, randomInRange(1, 6));
    return mapper(item, objs);
  });
};

const main = async () => {
  if (!email) {
    return console.error(
      `A super user is required... 'SUPER_USER=<email> ... yarn index:seed'`
    );
  }

  mongoose.connect(process.env.MONGO_HOST);

  const deleteAllT = timely.promise(deleteAll);
  const saveAndIndexAllT = timely.promise(saveAndIndexAll);

  await deleteAllT();
  log(`Deleted all data`, deleteAllT);

  const { items } = await generateData(projectSeedConfig, nProjects);
  const projects = items.map(x => new Project(x));
  await saveAndIndexAllT(projects);
  log(`Indexed ${projects.length} projects`, saveAndIndexAllT);

  const samples = await generateEntities(
    projects,
    sampleSeedConfig,
    nSamples,
    (item, project) =>
      new Sample({
        ...item,
        projectLabel: project.label,
        projectId: project._id
      })
  );
  await saveAndIndexAllT(samples);
  log(`Indexed ${samples.length} samples`, saveAndIndexAllT);

  const alignments = await generateEntities(
    samples,
    alignmentSeedConfig,
    nAlignments,
    (item, sample) =>
      new Alignment({
        ...item,
        projectLabel: sample.projectLabel,
        projectId: sample.projectId,
        sample: sample.name,
        sampleId: sample._id
      })
  );
  await saveAndIndexAllT(alignments);
  log(`Indexed ${alignments.length} alignments`, saveAndIndexAllT);

  const genomes = await generateEntitiesHasMany(
    samples,
    genomeSeedConfig,
    nGenomes,
    (item, samples) =>
      new Genome({
        ...item,
        sampleCount: samples.length,
        samples: samples.map(x => x._id)
      })
  );
  await saveAndIndexAllT(genomes);
  log(`Indexed ${genomes.length} genomes`, saveAndIndexAllT);

  const superUser = new User({ email, superUser: true });
  await superUser.save();

  console.log(`Created super user with email "${superUser.email}"`);

  console.log("Database seeded");

  mongoose.connection.close();
};

main();
