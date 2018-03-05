import { generateEsTypeComposer } from "@capsid/es/schema/utils";
import AlignmentSchema, { index } from "@capsid/mongo/schema/alignments";

const AlignmentEsTC = generateEsTypeComposer({
  typeName: "Alignment",
  schema: AlignmentSchema,
  index,
  type: "_doc"
});

export default AlignmentEsTC;
