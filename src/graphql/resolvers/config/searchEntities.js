import { index as projectIndex } from "@capsid/mongo/schema/projects";
import { index as alignmentIndex } from "@capsid/mongo/schema/alignments";
import { index as sampleIndex } from "@capsid/mongo/schema/samples";
import { index as genomeIndex } from "@capsid/mongo/schema/genomes";

export default [
  {
    name: "samples",
    typeName: "SampleSearch",
    mappedReadField: "sampleId",
    index: sampleIndex,
    scope: { projectId: "projectId" }
  },
  {
    name: "genomes",
    typeName: "GenomeSearch",
    field: "gi",
    mappedReadField: "genome",
    index: genomeIndex
  },
  {
    name: "projects",
    typeName: "ProjectSearch",
    mappedReadField: "projectId",
    index: projectIndex,
    scope: { projectId: "_id" }
  },
  {
    name: "alignments",
    typeName: "AlignmentSearch",
    mappedReadField: "alignmentId",
    index: alignmentIndex,
    scope: { projectId: "projectId" }
  }
];
