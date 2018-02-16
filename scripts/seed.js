import mocker from "mocker-data-generator";

import client from "@capsid/query/client";

const index = "projects";
const type = "_doc";

const project = {
  id: { chance: "guid" },
  description: { faker: "lorem.sentence" },
  roles: { function: () => ["admin", "owner"] },
  label: { values: ["label", "not label", "another"] },
  version: { faker: 'random.number({"min": 1, "max": 10})' },
  wikiLink: { values: ["http://google.com"] },
  name: { faker: "lorem.word" }
};

const generateData = () => {
  return mocker()
    .schema("projects", project, 50)
    .build();
};

const main = async () => {
  const { projects } = await generateData();
  await Promise.all(
    projects.map(body =>
      client.create({
        index,
        type,
        id: body.id,
        body
      })
    )
  );
};

main();
