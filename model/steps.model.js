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
        step_No: {
          type: Number,
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
