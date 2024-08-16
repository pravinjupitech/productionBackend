import { ProductionLabel } from "../model/productionLabel.model.js";

export const addLabel = async (req, res, next) => {
  try {
    const label = await ProductionLabel.create(req.body);
    return label
      ? res.status(200).json({ message: "Data Added", label, status: true })
      : res.status(404).json({ message: "Someting Went Wrong", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewLabel = async (req, res, next) => {
  try {
    const label = await ProductionLabel.find({}).sort({ sortorder: -1 });
    return label.length > 0
      ? res.status(200).json({ message: "Data Found", label, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewByIdLabel = async (req, res, next) => {
  try {
    const label = await ProductionLabel.findById(req.params.id);
    return label
      ? res.status(200).json({ message: "Data Found", label, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const UpdateLabel = async (req, res, next) => {
  try {
    const id = req.params.id;
    const label = await ProductionLabel.findById(id);
    if (!label) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    const updatedData = req.body;
    await ProductionLabel.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ message: "Data Updated", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const deleteLabel = async (req, res, next) => {
  try {
    const id = req.params.id;
    const label = await ProductionLabel.findById(id);
    if (!label) {
      return res.status(500).json({ error: "Not Found", status: false });
    }
    await ProductionLabel.findByIdAndDelete(id);
    res.status(200).json({ message: "Data Deleted ", label, status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
