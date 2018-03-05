import { generateEsTypeComposer } from "@capsid/es/schema/utils";
import GenomeSchema, { index } from "@capsid/mongo/schema/genomes";

const GenomeEsTC = generateEsTypeComposer({
  typeName: "Genome",
  schema: GenomeSchema,
  index,
  type: "_doc"
});

export default GenomeEsTC;
