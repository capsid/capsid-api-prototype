import mongoose from "mongoose";

import { createSuperUser } from "./utils";

const main = async () => {
  mongoose.connect(process.env.MONGO_HOST);

  const email = process.env.SUPER_USER;
  await createSuperUser({ email });

  mongoose.connection.close();
};

main();
