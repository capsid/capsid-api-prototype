import { generateEsTypeComposer } from "@capsid/es/schema/utils";
import SampleSchema, { index, type } from "@capsid/mongo/schema/samples";

const SampleEsTC = generateEsTypeComposer({
  typeName: "Sample",
  schema: SampleSchema,
  index,
  type
});

export default SampleEsTC;
