import { generateEsTypeComposer } from "@capsid/es/schema/utils";
import SampleSchema, { index } from "@capsid/mongo/schema/samples";

const SampleEsTC = generateEsTypeComposer({
  typeName: "Sample",
  schema: SampleSchema,
  index,
  type: "_doc"
});

export default SampleEsTC;
