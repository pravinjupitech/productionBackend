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
    rHeading1: {
      type: String,
    },
    rUnit1: {
      type: String,
    },
    rHeading2: {
      type: String,
    },
    rUnit2: {
      type: String,
    },
    rHeading3: {
      type: String,
    },
    rUnit3: {
      type: String,
    },
    fHeading1: {
      type: String,
    },
    fUnit1: {
      type: String,
    },
    fHeading2: {
      type: String,
    },
    fUnit2: {
      type: String,
    },
    fHeading3: {
      type: String,
    },
    fUnit3: {
      type: String,
    },
    wHeading1: {
      type: String,
    },
    wUnit1: {
      type: String,
    },
    wHeading2: {
      type: String,
    },
    wUnit2: {
      type: String,
    },
    wHeading3: {
      type: String,
    },
    wUnit3: {
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
