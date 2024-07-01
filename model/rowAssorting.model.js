import mongoose from "mongoose";
const RowAssortingSchema = new mongoose.Schema(
  {
    assorting: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        given_piece: { type: Number },
        given_weight: { type: Number },
        given_unit: { type: String },
        received_piece: { type: Number },
        received_weight: { type: Number },
        received_unit: { type: String },
        wastage_piece: { type: Number },
        wastage_weight: { type: Number },
        wastage_Per_piece: { type: Number },
        wastage_per_weight: { type: Number },
      },
    ],
  },
  { timestamps: true }
);
export const RowAssorting = mongoose.model("rowAssorting", RowAssortingSchema);
