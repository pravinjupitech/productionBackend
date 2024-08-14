import { RowAssorting } from "../model/rowAssorting.model.js";

export const RowAssortingAdd = async (req, res, next) => {
  try {
    // req.body.assorting = JSON.parse(req.body.assorting);
    const rowAssorting = await RowAssorting.create(req.body);
    return rowAssorting
      ? res.status(200).json({
          message: "Data Saved Successfully",
          rowAssorting,
          status: true,
        })
      : res
          .status(404)
          .json({ message: "Something Went Wrong", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const RowAssortingViewAll = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.find().sort({ sortorder: -1 });
    return rowAssorting.length > 0
      ? res.status(200).json({
          message: "Data Found Successfully",
          rowAssorting,
          status: true,
        })
      : res.status(404).json({ message: "Not Found", status: false });
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
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const rowAssortingEdit = async (req, res, next) => {
  try {
    // req.body.assorting = JSON.parse(req.body.assorting);
    const updateData = req.body;
    const rowAssorting = await RowAssorting.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
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
      : res.status(404).json({ message: "Data Not Daleted", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const rowAssortingByIdUpdate = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.findById(req.params.id);
    if (rowAssorting) {
      const assortingId = req.params.assortingId;
      const assortingIndex = rowAssorting.finished_raw.findIndex(
        (tot) => tot._id.toString() === assortingId
      );
      if (assortingIndex > -1) {
        const existingAssorting = rowAssorting.finished_raw[assortingIndex];
        const updatedAssorting = { ...existingAssorting._doc, ...req.body };

        rowAssorting.finished_raw[assortingIndex] = updatedAssorting;
        await rowAssorting.save();
        res.status(200).json({
          message: "Data Updated Successfully",
          updatedAssorting: rowAssorting.finished_raw[assortingIndex],
          status: true,
        });
      } else {
        return res.status(404).json({
          message: "finished Raw Not Found",
          status: false,
        });
      }
    } else {
      return res.status(404).json({
        message: " Not Found",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const rowAssortingByIdDelete = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.findById(req.params.id);
    if (rowAssorting) {
      const assortingId = req.params.assortingId;
      const assortingIndex = rowAssorting.finished_raw.findIndex(
        (tot) => tot._id.toString() === assortingId
      );
      if (assortingIndex > -1) {
        rowAssorting.finished_raw.splice(assortingIndex, 1);
        if (rowAssorting.finished_raw.length === 0) {
          await RowAssorting.findByIdAndDelete(req.params.id);
          return res.status(200).json({
            message: "Data Deleted Successfully",
            status: true,
          });
        } else {
          await rowAssorting.save();
          return res.status(200).json({
            message: "Data Deleted Successfully",
            rowAssorting,
            status: true,
          });
        }
      } else {
        return res.status(404).json({
          message: "finished Raw Not Found",
          status: false,
        });
      }
    } else {
      return res.status(404).json({
        message: "Not Found",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};
