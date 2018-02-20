import { generate } from "mongoose-elasticsearch-xp/lib/mapping";

import client from "@capsid/es/client";
import projectSchema from "@capsid/mongo/schema/projects";
import sampleSchema from "@capsid/mongo/schema/samples";

[["projects", projectSchema], ["samples", sampleSchema]].map(
  ([index, schema]) =>
    client.indices.create(
      {
        index,
        body: { mappings: { _doc: { properties: generate(schema) } } }
      },
      () => console.log(`${index} index created`)
    )
);
