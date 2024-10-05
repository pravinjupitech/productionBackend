import mongoose from "mongoose";
const assignProductSchema = new mongoose.Schema(
  {
    step_name: {
      type: String,
    },
    user_name: {
      type: String,
    },
    processName: {
      type: String,
    },
    database: {
      type: String,
    },
    product_details: [
      {
        rProduct_name: {
          type: String,
        },
        rProduct_name_Units: [],
        fProduct_name: {
          type: String,
        },
        fProduct_name_Units: {
          type: Number,
        },
        fProduct_name_Units: [],
        wProduct_name: {
          type: String,
        },
        wProduct_name_Units: [],
      },
    ],
    totalStep: {
      type: Number,
    },
    currentStep: {
      type: String,
    },
  },
  { timestamps: true }
);
export const AssignProduction = mongoose.model(
  "assignProduction",
  assignProductSchema
);
