import client from "@capsid/query/client";
import projects from "@capsid/mappings/projects";
import samples from "@capsid/mappings/samples";

const mappings = {
  projects,
  samples
};

Object.keys(mappings).forEach(key =>
  client.indices.create(
    {
      index: key,
      body: { mappings: { _doc: mappings[key].mapping } }
    },
    () => console.log(`${key} index created.`)
  )
);
