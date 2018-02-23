import { generateEsTypeComposer } from "@capsid/es/schema/utils";
import GenomeSchema, { index, type } from "@capsid/mongo/schema/genomes";

const GenomeEsTC = generateEsTypeComposer({
  typeName: "Genome",
  schema: GenomeSchema,
  index,
  type
});

export default GenomeEsTC;
