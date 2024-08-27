import { AdminProduction } from "../model/adminProductionAdd.model.js";

export const addProduct = async (req, res, next) => {
  try {
    const product = await AdminProduction.create(req.body);
    return product
      ? res.status(200).json({ message: "Data Added", product, status: true })
      : res
          .status(404)
          .json({ message: "Something Went Wrong", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewProduct = async (req, res, next) => {
  try {
    const product = await AdminProduction.find({}).sort({ sortorder: -1 });
    return product
      ? res.status(200).json({ message: "Data Found", product, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewByIdProduct = async (req, res, next) => {
  try {
    const product = await AdminProduction.findById(req.params.id);
    return product
      ? res.status(200).json({ message: "Data Found", product, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await AdminProduction.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    const updatedData = req.body;
    await AdminProduction.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ message: "Data Updated", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await AdminProduction.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    await AdminProduction.findByIdAndDelete(id);
    res.status(200).json({ message: "Data Deleted", product, status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
