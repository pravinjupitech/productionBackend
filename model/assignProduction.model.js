import mongoose from "mongoose";
const assignProductSchema = new mongoose.Schema(
  {
    step_name: {
      type: String,
    },
    user_name: {
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
        fProduct_name: {
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
        wProduct_name: {
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
      },
    ],
    totalStep: {
      type: Number,
    },
    currentStep: {
      type: Number,
    },
  },
  { timestamps: true }
);
export const AssignProduction = mongoose.model(
  "assignProduction",
  assignProductSchema
);
/*

*/
