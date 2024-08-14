import mongoose from "mongoose";
const RowAssortingSchema = new mongoose.Schema(
  {
    workerName: {
      type: String,
    },
    raw_product_name: {
      type: String,
    },
    quantity_raw: {
      type: Number,
    },
    finished_raw: [
      {
        shape: {
          type: String,
        },
        size: {
          type: String,
        },
        qty: {
          type: Number,
        },
        weight: {
          type: String,
        },
      },
    ],
    wastage_raw: {
      type: String,
    },
    wastage_per: {
      type: Number,
    },
    // assorting: [
    //   {
    //     userId: { type: String },
    //     productId: { type: String },
    //     given_piece: { type: Number },
    //     given_weight: { type: Number },
    //     given_unit: { type: String },
    //     received_piece: { type: Number },
    //     received_weight: { type: Number },
    //     received_unit: { type: String },
    //     wastage_piece: { type: Number },
    //     wastage_weight: { type: Number },
    //     wastage_Per_piece: { type: Number },
    //     wastage_per_weight: { type: Number },
    //     database: { type: String },
    //   },
    // ],
    // database: { type: String },
  },
  { timestamps: true }
);
export const RowAssorting = mongoose.model("rowAssorting", RowAssortingSchema);
