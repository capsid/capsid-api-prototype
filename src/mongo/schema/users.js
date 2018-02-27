import mongoose, { Schema } from "mongoose";

const collection = "user";

const UserSchema = new Schema(
  {
    email: { type: String },
    superUser: { type: Boolean }
  },
  {
    collection,
    timestamps: true
  }
);

export const User = mongoose.model("User", UserSchema);

export default UserSchema;
