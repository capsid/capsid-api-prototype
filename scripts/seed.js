import _ from "lodash";
import mocker from "mocker-data-generator";
import mongoose from "mongoose";
import timely from "timely";

import { createIndices, createSuperUser } from "./utils";
import { Project } from "@capsid/mongo/schema/projects";
import { Sample } from "@capsid/mongo/schema/samples";
import { Alignment } from "@capsid/mongo/schema/alignments";
import { MappedRead } from "@capsid/mongo/schema/mappedReads";
import { Genome } from "@capsid/mongo/schema/genomes";
import { User } from "@capsid/mongo/schema/users";
import { Access } from "@capsid/mongo/schema/access";
import { Statistics } from "@capsid/mongo/schema/statistics";

const models = [
  Project,
  Sample,
  Alignment,
  MappedRead,
  Genome,
  User,
  Access,
  Statistics
];

const email = process.env.SUPER_USER;

const nProjects = +process.env.N_PROJECTS || 10;
const nSamples = +process.env.N_SAMPLES || 40; // per project
const nAlignments = +process.env.N_ALIGNMENTS || 2; // per sample
const nGenomes = +process.env.N_GENOMES || 16000; // total
const nMappedReads = +process.env.N_READS || 20000; // total

const projectSeedConfig = {
  id: { chance: "guid" },
  description: { faker: "lorem.sentence" },
  label: { faker: "lorem.sentence" },
  version: { faker: 'random.number({"min": 1, "max": 10})' },
  wikiLink: { values: ["http://google.com"] },
  name: { faker: "lorem.word" }
};

const sampleSeedConfig = {
  id: { chance: "guid" },
  source: { faker: "lorem.word" },
  description: { faker: "lorem.sentence" },
  cancer: { values: ["typeA", "typeB", "typeC"] },
  version: { faker: 'random.number({"min": 3, "max": 7})' },
  name: { faker: "lorem.sentence" }
};

const alignmentSeedConfig = {
  id: { chance: "guid" },
  name: { faker: "lorem.sentence" },
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
  accession: { incrementalId: 1 },
  gi: { incrementalId: 1 },
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
  isRef: { values: [true, false] }
};

const statisticsConfig = {
  id: { chance: "guid" },
  geneHits: { faker: 'random.number({"min": 100, "max": 1000})' },
  geneCoverageMax: { function: Math.random },
  geneCoverageAvg: { function: Math.random },
  genomeHits: { faker: 'random.number({"min": 100, "max": 1000})' },
  genomeCoverage: { function: Math.random },
  pathgenomeHits: { faker: 'random.number({"min": 100, "max": 1000})' },
  pathgenomeCoverage: { function: Math.random },
  pathgeneHits: { faker: 'random.number({"min": 100, "max": 1000})' },
  pathgeneCoverageAvg: { function: Math.random },
  pathgeneCoverageMax: { function: Math.random },
  tags: { values: [["lowMaxCover", "pathlowMaxCover"]] }
};

const generateData = (config, n) =>
  mocker()
    .schema("items", config, n)
    .build();

const deleteAll = async () => {
  await createIndices();
  await Promise.all(models.map(x => x.deleteMany()));
};
const deleteAllT = timely.promise(deleteAll);

const saveAndIndexAll = async models => {
  const Model = models[0].constructor;
  await Model.insertMany(models);
  return Model.esSynchronize();
};
const saveAndIndexAllT = timely.promise(saveAndIndexAll);

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

const pickRandomElement = arr => arr[randomInRange(0, arr.length)];

const saveProjectsSamplesAndAlignments = async () => {
  const { items: projectItems } = await generateData(
    projectSeedConfig,
    nProjects
  );
  const projects = projectItems.map(x => new Project(x));
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

  return alignments;
};

const saveGenomes = async () => {
  const genomes = (await generateData(genomeSeedConfig, nGenomes)).items.map(
    x => new Genome(x)
  );
  await saveAndIndexAllT(genomes);
  log(`Indexed ${genomes.length} genomes`, saveAndIndexAllT);
  return [genomes[0].gi, genomes[genomes.length - 1].gi];
};

const maybeAddStats = ({ stats, alignment, accessor, gi, item, ownerType }) => {
  const ownerId = alignment[accessor];
  if (!stats[ownerId]) stats[ownerId] = {};
  if (!stats[ownerId][gi])
    stats[ownerId][gi] = new Statistics({
      ...item(),
      projectId: alignment.projectId,
      projectLabel: alignment.projectLabel,
      project: alignment.projectLabel,
      accession: gi,
      gi,
      genome: gi,
      sampleId: alignment.sampleId,
      sample: alignment.sample,
      ownerType,
      ownerId
    });
};

const saveMappedReads = async (alignments, minMaxGi) => {
  const projectStats = {};
  const sampleStats = {};
  const alignmentStats = {};
  const [minGi, maxGi] = minMaxGi;
  const { items } = await generateData(statisticsConfig, 20);
  const item = () => items[randomInRange(0, 20)];
  let page = 0;
  let pageSize = 20000;
  while (page * pageSize < nMappedReads) {
    page++;
    const { items: mappedReadItems } = await generateData(
      mappedReadConfig,
      pageSize
    );
    const mappedReads = mappedReadItems.map(x => {
      const alignment = pickRandomElement(alignments);
      const gi = randomInRange(minGi, maxGi);
      maybeAddStats({
        stats: projectStats,
        alignment,
        accessor: "projectId",
        gi,
        item,
        ownerType: "project"
      });
      maybeAddStats({
        stats: sampleStats,
        alignment,
        accessor: "sampleId",
        gi,
        item,
        ownerType: "sample"
      });
      maybeAddStats({
        stats: alignmentStats,
        alignment,
        accessor: "_id",
        gi,
        item,
        ownerType: "alignment"
      });
      return new MappedRead({
        ...x,
        projectLabel: alignment.projectLabel,
        projectId: alignment.projectId,
        sample: alignment.sample,
        sampleId: alignment.sampleId,
        alignment: alignment.name,
        alignmentId: alignment._id,
        genome: gi
      });
    });
    await saveAndIndexAllT(mappedReads);
    log(`Indexed ${mappedReads.length} mappedReads`, saveAndIndexAllT);
  }

  return _.flatten(
    [projectStats, sampleStats, alignmentStats].map((x, i) =>
      _.flatten(
        Object.keys(x).map(objId =>
          Object.keys(x[objId]).map(gi => x[objId][gi])
        )
      )
    )
  );
};

const main = async () => {
  if (!email) {
    return console.error(
      `A super user is required... 'SUPER_USER=<email> ... yarn index:seed'`
    );
  }

  mongoose.connect(process.env.MONGO_HOST);
  await deleteAllT();
  log(`Deleted all data`, deleteAllT);

  const alignments = await saveProjectsSamplesAndAlignments();

  const minMaxGi = await saveGenomes();

  const statistics = await saveMappedReads(alignments, minMaxGi);
  await saveAndIndexAllT(statistics);
  log(`Indexed ${statistics.length} statistics`, saveAndIndexAllT);

  await createSuperUser({ email });

  console.log("Database seeded");

  mongoose.connection.close();
};

main();
