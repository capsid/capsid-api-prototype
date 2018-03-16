import { User } from "@capsid/mongo/schema/users";

export default ({ email }) => {
  if (!email) {
    return console.error(
      `A super user is required... 'SUPER_USER=<email> ... yarn index:seed'`
    );
  }

  console.log(`Creating super user with email "${email}"`);

  const superUser = new User({ email, superUser: true });
  return superUser.save();
};
