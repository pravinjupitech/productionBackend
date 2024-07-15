import mongoose from "mongoose";
const shappingSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  productId: {
    type: String,
  },
  received_piece: {
    type: Number,
  },
  received_weight: {
    type: Number,
  },
  received_unit: {
    type: String,
  },
  wastage_piece: {
    type: Number,
  },
  wastage_weight: {
    type: Number,
  },
  wastage_Per_piece: {
    type: Number,
  },
  wastage_per_weight: {
    type: Number,
  },
  database: {
    type: String,
  },
});
export const Shapping = mongoose.model("shapping", shappingSchema);
