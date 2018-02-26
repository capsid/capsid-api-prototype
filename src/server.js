import { Engine } from "apollo-engine";
import compression from "compression";
import cors from "cors";
import { GraphQLServer } from "graphql-yoga";
import mongoose from "mongoose";
import urlJoin from "url-join";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

import schema from "@capsid/graphql/schema";
import { User } from "@capsid/mongo/schema/users";

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

const verifyJwt = ({ request, publicKey }) => {
  const op = publicKey ? jwt.verify : jwt.decode;
  const { context: { user } } = op(request.headers.token, publicKey);
  return user;
};

const main = async () => {
  mongoose.connect(process.env.MONGO_HOST);

  const engine = new Engine(engineOpts);
  engine.start();

  const publicKey = await fetch(
    urlJoin(process.env.EGO_API_ROOT, "/oauth/token/public_key")
  ).then(res => res.text());

  const server = new GraphQLServer({
    schema,
    context: async ({ request }) => {
      const { email } = verifyJwt({ request });
      const user = await User.findOne({ email });
      return { user };
    }
  });

  server.express.use(cors()); // graphql-yoga cors doesn't seem to work
  server.express.use(compression());
  server.express.use(engine.expressMiddleware());
  server.express.use(async (request, res, next) => {
    let message = null;
    try {
      const user = verifyJwt({ request, publicKey });
      if (!await User.count({ email: user.email })) message = "user not found";
    } catch (e) {
      message = "invalid or expired token";
    }
    message ? res.send({ errors: [{ code: 403, message }] }) : next();
  });

  server.start(serverOpts, ({ port }) =>
    console.log(`Server is running on localhost: ${port}`)
  );
};

main();
