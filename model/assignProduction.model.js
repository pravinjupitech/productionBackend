import mongoose from "mongoose";
const assignProductSchema = new mongoose.Schema(
  {
    step_name: {
      type: String,
    },
    product_details: [
      {
        user_name: {
          type: String,
        },
        product_name: {
          type: String,
        },
        piece: {
          type: Number,
        },
        weight: {
          type: Number,
        },
        unit: {
          type: String,
        },
      },
    ],
    final_product_qty: {
      type: Number,
    },
    final_product_name: {
      type: String,
    },
    diff_Production_target: {
      type: Number,
    },
    wastage_qty: {
      type: Number,
    },
    wastage_Per: {
      type: Number,
    },
    target_achive_val: {
      type: Number,
    },
    target_achive_per: {
      type: Number,
    },
  },
  { timestamps: true }
);
export const AssignProduction = mongoose.model(
  "assignProduction",
  assignProductSchema
);
