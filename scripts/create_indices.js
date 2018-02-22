import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import client from "@capsid/es/client";

import projects, { index as projectIndex } from "@capsid/mongo/schema/projects";
import samples, { index as sampleIndex } from "@capsid/mongo/schema/samples";
import alignments, {
  index as alignmentIndex
} from "@capsid/mongo/schema/alignments";
import mapped, { index as mappedIndex } from "@capsid/mongo/schema/mappedReads";

const mappings = {
  [projectIndex]: projects,
  [sampleIndex]: samples,
  [alignmentIndex]: alignments,
  [mappedIndex]: mapped
};

Object.keys(mappings).forEach(index => {
  const generated = generate(mappings[index]);
  const esMapping = Object.keys(generated).reduce((obj, key) => {
    const field = generated[key];
    return {
      ...obj,
      [key]: ["keyword", "text"].includes(field.type)
        ? { ...field, fields: { search: { type: "text" } } }
        : field
    };
  }, {});
  client.indices.create(
    {
      index,
      body: { mappings: { _doc: { properties: esMapping } } }
    },
    () => console.log(`${index} index created`)
  );
});
