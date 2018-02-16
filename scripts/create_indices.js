import client from "@capsid/query/client";
import projects from "@capsid/mappings/projects";

client.indices.create(
  {
    index: "projects",
    body: { mappings: { _doc: projects } }
  },
  () => console.log("Projects index created.")
);
