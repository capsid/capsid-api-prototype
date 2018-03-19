import mongoose from "mongoose";

export const close = () => mongoose.connection.close();

export default async () => {
  return new Promise((res, rej) => {
    mongoose.connect(process.env.MONGO_HOST);
    const db = mongoose.connection;
    db.on("error", err => rej(err));
    db.on("open", () => res());
  });
};
