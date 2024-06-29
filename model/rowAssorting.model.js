import mongoose from "mongoose";
const RowAssortingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    productId: {
      type: String,
    },
    productName: {
      type: String,
    },
    innerQty: [
      {
        piece: { type: Number },
        weight: { type: String },
      },
    ],
  },
  { timestamps: true }
);
export const RowAssorting = mongoose.model("rowAssorting", RowAssortingSchema);
