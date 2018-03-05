import { generateEsTypeComposer } from "@capsid/es/schema/utils";
import MappedReadSchema, { index } from "@capsid/mongo/schema/mappedReads";

const MappedReadEsTC = generateEsTypeComposer({
  typeName: "MappedRead",
  schema: MappedReadSchema,
  index,
  type: "_doc"
});

export default MappedReadEsTC;
