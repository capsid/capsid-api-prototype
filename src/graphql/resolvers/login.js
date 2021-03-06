import fetch from "node-fetch";
import withQuery from "with-query";
import urlJoin from "url-join";
import jwt from "jsonwebtoken";

import { Access } from "@capsid/mongo/schema/access";
import { User } from "@capsid/mongo/schema/users";

const requestEgoJwt = async ({ token, provider }) =>
  fetch(
    withQuery(urlJoin(process.env.EGO_API_ROOT, `oauth/${provider}/token`), {
      client_id: process.env.EGO_APP_ID
    }),
    {
      method: "GET",
      headers: { token }
    }
  ).then(x => x.text());

const login = async ({ args: { token, provider } }) => {
  if (!token) throw new Error(`Missing token`);
  if (!provider) throw new Error(`Missing provider`);

  let egoJwt;
  let egoUser;
  try {
    egoJwt = await requestEgoJwt({ token, provider });
    egoUser = jwt.decode(egoJwt).context.user;
  } catch (e) {
    console.error(e);
    throw new Error("An error has occurred, please try again");
  }

  const user = await User.findOne({ email: egoUser.email });
  const access = await Access.find({ userEmail: egoUser.email });

  if (!user || (!user.superUser && !access.length))
    throw new Error("User not found");

  return {
    token: egoJwt,
    email: egoUser.email,
    firstName: egoUser.firstName,
    lastName: egoUser.lastName,
    superUser: user.superUser,
    access
  };
};

export default login;
