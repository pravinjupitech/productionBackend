import mongoose from "mongoose";
const RowAssortingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    productId: {
      type: String,
    },
    Product_Title: {
      type: String,
    },
    finishedRow: [
      {
        piece: { type: Number },
        weight: { type: String },
        unit: { type: String },
      },
    ],
    wastage: [
      {
        piece: { type: Number },
        weight: { type: String },
        unit: { type: String },
      },
    ],
    wastagePieacePer: {
      type: String,
    },
    wastageWeightPer: {
      type: String,
    },
  },
  { timestamps: true }
);
export const RowAssorting = mongoose.model("rowAssorting", RowAssortingSchema);
