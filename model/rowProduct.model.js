import mongoose, { Mongoose } from "mongoose";
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
      default: 0,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "warehouse",
    },
    warehouseName: { type: String },
    SubStep: {
      type: String,
    },
    NextSubStep: {
      type: String,
    },
    stockUnit: {
      type: String,
    },
    secondaryUnit: {
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
    rawValues: [
      {
        rawMaterial: { type: String },
        unit: { type: String },
        qty: { type: Number },
        rate: { type: Number },
        Price: { type: Number },
      },
    ],
    grossTotal: {
      type: Number,
    },
    expensePercentage: { type: Number },
    netAmount: { type: Number },
    status: {
      type: String,
      default: "Active",
    },
    targetValues: [
      {
        rawMaterial: { type: String },
        step: { type: String },
        unit: [],
      },
    ],
  },
  { timestamps: true }
);
export const RowProduct = mongoose.model("rowProduct", rowProductSchema);
