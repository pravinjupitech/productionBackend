import mongoose from "mongoose";

const adminProductSchema = new mongoose.Schema(
  {
    laborname: {
      type: String,
    },
    addProduct: [
      {
        productName: {
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
    dif_production_target: {
      type: Number,
    },
    wastage_qty: {
      type: Number,
    },
    wastage_per: {
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

export const AdminProduction = mongoose.model(
  "adminProductionAdd",
  adminProductSchema
);
