import { TypeComposer } from "graphql-compose";

import { AccessTC } from "@capsid/graphql/access";
import { login } from "@capsid/graphql/resolvers";

export const LoginTC = TypeComposer.create(`
  type Login {
    token: String
    email: String
    firstName: String
    lastName: String
    superUser: Boolean
  }
`);

LoginTC.setField("access", { type: [AccessTC] });

LoginTC.addResolver({
  name: "login",
  kind: "query",
  args: {
    token: "String!",
    provider: "String!"
  },
  type: LoginTC,
  resolve: login
});
