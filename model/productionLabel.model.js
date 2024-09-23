import mongoose from "mongoose";
const LabelSchema = new mongoose.Schema({
  steps: [
    {
      note: {
        type: String,
      },
      step_Name: {
        type: String,
      },
    },
  ],
});
export const ProductionLabel = mongoose.model("productionLabel", LabelSchema);
