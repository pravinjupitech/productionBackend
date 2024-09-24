import mongoose from "mongoose";
const stepsSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);
export const StepsModel = mongoose.model("steps", stepsSchema);