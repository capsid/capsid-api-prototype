import { generateEsTypeComposer } from "@capsid/es/schema/utils";
import AlignmentSchema, { index, type } from "@capsid/mongo/schema/alignments";

const AlignmentEsTC = generateEsTypeComposer({
  typeName: "Alignment",
  schema: AlignmentSchema,
  index,
  type
});

export default AlignmentEsTC;
