import { Engine } from "apollo-engine";
import compression from "compression";
import cors from "cors";
import { GraphQLServer } from "graphql-yoga";
import urlJoin from "url-join";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

import schema from "@capsid/graphql/schema";
import { User } from "@capsid/mongo/schema/users";
import { connect } from "@capsid/mongo/utils";
import { info } from "@capsid/services/logger";

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

const main = async () => {
  await connect();

  const engine = new Engine(engineOpts);
  engine.start();

  const publicKey = await fetch(
    urlJoin(process.env.EGO_API_ROOT, "/oauth/token/public_key")
  ).then(res => res.text());

  const server = new GraphQLServer({
    schema,
    context: async ({ request }) => {
      try {
        let { context: { user: { email } } } = jwt.verify(
          request.headers.token,
          publicKey
        );
        const user = await User.findOne({ email });
        return { user };
      } catch (e) {
        console.error(e);
        return {};
      }
    }
  });

  server.express.use(cors()); // graphql-yoga cors doesn't seem to work
  server.express.use(compression());
  server.express.use(engine.expressMiddleware());
  server.start(serverOpts, ({ port }) =>
    info(`Server is running on localhost: ${port}`)
  );
};

main();
