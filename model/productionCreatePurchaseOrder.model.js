import mongoose from "mongoose";
const purchaseOrderSchema = new mongoose.Schema(
  {
    party_name: {
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
    price: {
      type: Number,
    },
    tax: {
      type: Number,
    },
  },
  { timestamps: true }
);
export const ProductionPurchaseOrder = mongoose.model(
  "productionPurchaseOrder",
  purchaseOrderSchema
);
