import mongoose from "mongoose";
const stepsSchema = new mongoose.Schema(
  {
    processName: {
      type: String,
    },
    steps: [
      {
        note: {
          type: String,
        },
        step_Name: {
          type: String,
        },
      },
    ],
    createdBy: {
      type: String,
    },
  },
  { timestamps: true }
);
export const StepsModel = mongoose.model("steps", stepsSchema);
