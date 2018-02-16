import { GraphQLServer } from "graphql-yoga";

import schema from "@capsid/schema";

require("dotenv").config();

const options = {
  port: process.env.PORT,
  endpoint: "/graphql",
  subscriptions: "/subscriptions",
  playground: "/playground"
};
const server = new GraphQLServer({ schema });

server.start(options, () =>
  console.log("Server is running on localhost:" + options.port)
);
