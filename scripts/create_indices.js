import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import client from "@capsid/es/client";

import projects from "@capsid/mongo/schema/projects";
import samples from "@capsid/mongo/schema/samples";
import alignments from "@capsid/mongo/schema/alignments";

const mappings = { projects, samples, alignments };

Object.keys(mappings).forEach(index =>
  client.indices.create(
    {
      index,
      body: { mappings: { _doc: { properties: generate(mappings[index]) } } }
    },
    () => console.log(`${index} index created`)
  )
);
