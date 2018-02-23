import { generateEsTypeComposer } from "@capsid/es/schema/utils";
import MappedReadSchema, {
  index,
  type
} from "@capsid/mongo/schema/mappedReads";

const MappedReadEsTC = generateEsTypeComposer({
  typeName: "MappedRead",
  schema: MappedReadSchema,
  index,
  type
});

export default MappedReadEsTC;
