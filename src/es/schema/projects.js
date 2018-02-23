import { generateEsTypeComposer } from "@capsid/es/schema/utils";
import ProjectSchema, { index, type } from "@capsid/mongo/schema/projects";

const ProjectEsTC = generateEsTypeComposer({
  typeName: "Project",
  schema: ProjectSchema,
  index,
  type
});

export default ProjectEsTC;
