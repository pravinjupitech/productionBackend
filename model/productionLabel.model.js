import mongoose from "mongoose";
const LabelSchema = new mongoose.Schema({
  production_step_name: {
    type: String,
  },
  note: {
    type: String,
  },
});
export const ProductionLabel = mongoose.model("/productionLabel", LabelSchema);