import { Engine } from "apollo-engine";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import { GraphQLServer } from "graphql-yoga";

import schema from "@capsid/schema";

const endpoint = "/graphql";

const serverOpts = {
  port: process.env.PORT,
  endpoint,
  subscriptions: "/subscriptions",
  playground: "/playground",
  tracing: true,
  cacheControl: true
};

const engineOpts = {
  engineConfig: {
    apiKey: process.env.APOLLO_ENGINE_API_KEY,
    logging: { level: process.env.APOLLO_ENGINE_LOG },
    stores: [
      {
        name: "pq",
        inMemory: {
          cacheSize: "5000000"
        }
      }
    ],
    persistedQueries: { store: "pq" }
  },
  endpoint,
  graphqlPort: process.env.PORT
};

const engine = new Engine(engineOpts);
engine.start();

if (process.env.MOCK) addMockFunctionsToSchema({ schema });

const server = new GraphQLServer({ schema });
server.express.use(cors()); // graphql-yoga cors doesn't seem to work
server.express.use(compression());
server.express.use(engine.expressMiddleware());
server.start(serverOpts, ({ port }) =>
  console.log(`Server is running on localhost: ${port}`)
);
