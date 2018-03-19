import { createSuperUser } from "./utils";
import { connect, close } from "@capsid/mongo/utils";

const main = async () => {
  await connect();

  const email = process.env.SUPER_USER;
  await createSuperUser({ email });

  close();
};

main();
