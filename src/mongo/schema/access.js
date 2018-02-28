import mongoose from "mongoose";

const collection = "access";

const AccessSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    },
    projectLabel: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    userEmail: { type: String },
    access: { type: Array }
  },
  {
    collection,
    timestamps: true
  }
);

export const Access = mongoose.model("Access", AccessSchema);

export default Access;
