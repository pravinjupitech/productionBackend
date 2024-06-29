import { RowAssorting } from "../model/rowAssorting.model.js";

export const RowAssortingAdd = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.create(req.body);
    return rowAssorting
      ? res.status(200).json({
          message: "Data Saved Successfully",
          rowAssorting,
          status: true,
        })
      : res
          .status(404)
          .json({ message: "RowAssorting Not Save", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const RowAssortingViewAll = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.find();
    return rowAssorting
      ? res.status(200).json({
          message: "Data Found Successfully",
          rowAssorting,
          status: true,
        })
      : res
          .status(404)
          .json({ message: "RowAssorting Not Found", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const rowAssortingViewById = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.findById(req.params.id);
    return rowAssorting
      ? res.status(200).json({
          message: "Data Found Successfully",
          rowAssorting,
          status: true,
        })
      : res
          .status(404)
          .json({ message: "RowAssorting Not Found", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const rowAssortingEdit = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    return rowAssorting
      ? res.status(200).json({
          message: "Data Updated Successfully",
          rowAssorting,
          status: true,
        })
      : res.status(404).json({ message: "Data Not Updated", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const rowAssortingDelete = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.findByIdAndDelete(req.params.id);
    return rowAssorting
      ? res.status(200).json({
          message: "Data Deleted Successfully",
          rowAssorting,
          status: true,
        })
      : res.status(404).json({ message: "Data Not Deleted", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const innerQtyDelete = async (req, res, next) => {
  try {
    const innerQty = await RowAssorting.findByIdAndDelete(req.params.id);
    return innerQty
      ? res.status(200).json({
          message: "Data Deleted Successfully",
          innerQty,
          status: true,
        })
      : res.status(404).json({ message: "Data Not Deleted", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};
