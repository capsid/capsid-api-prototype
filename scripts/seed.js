import _ from "lodash";
import mocker from "mocker-data-generator";

import client from "@capsid/query/client";

const project = {
  id: { chance: "guid" },
  description: { faker: "lorem.sentence" },
  roles: { function: () => ["admin", "owner"] },
  label: { values: ["label", "not label", "another"] },
  version: { faker: 'random.number({"min": 1, "max": 10})' },
  wikiLink: { values: ["http://google.com"] },
  name: { faker: "lorem.word" }
};

const sample = {
  id: { chance: "guid" },
  source: { faker: "lorem.word" },
  projectLabel: { values: ["label", "not label", "another"] },
  role: { values: ["admin", "owner"] },
  description: { faker: "lorem.sentence" },
  cancer: { values: ["typeA", "typeB", "typeC"] },
  version: { faker: 'random.number({"min": 3, "max": 7})' },
  name: { faker: "lorem.word" }
};

const main = async () => {
  const data = await mocker()
    .schema("projects", project, 50)
    .schema("samples", sample, 50)
    .build();

  await Promise.all(
    _.flatten(
      Object.keys(data).map(key =>
        data[key].map(body =>
          client.create({
            index: key,
            type: "_doc",
            id: body.id,
            body
          })
        )
      )
    )
  );
};

main();
