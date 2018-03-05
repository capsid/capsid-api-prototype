import { generateEsTypeComposer } from "@capsid/es/schema/utils";
import ProjectSchema, { index } from "@capsid/mongo/schema/projects";

const ProjectEsTC = generateEsTypeComposer({
  typeName: "Project",
  schema: ProjectSchema,
  index,
  type: "_doc"
});

export default ProjectEsTC;
