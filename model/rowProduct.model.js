import mongoose from "mongoose";
const rowProductSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    created_by: {
      type: String,
    },
    database: {
      type: String,
    },
    qty: {
      type: Number,
    },
    warehouse: {
      type: String,
    },
    category: {
      type: String,
    },
    SubCategory: {
      type: String,
    },
    Product_Title: {
      type: String,
    },
    Opening_Stock: {
      type: Number,
    },
    MIN_stockalert: {
      type: Number,
    },
    Units: [],
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);
export const RowProduct = mongoose.model("rowProduct", rowProductSchema);
