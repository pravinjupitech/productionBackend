import { Shapping } from "../model/shapping.model.js";

export const addShapping = async (req, res, next) => {
  try {
    const shapping = await Shapping.create(req.body);
    return shapping
      ? res
          .status(200)
          .json({ message: "Data Add Successfully", shapping, status: true })
      : res.status(404).json({ message: "Data Not Added", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong", status: false });
  }
};

export const viewShapping = async (req, res, next) => {
  try {
    const shapping = await Shapping.find();
    return shapping
      ? res
          .status(200)
          .json({ message: "Data Found Successfully", shapping, status: true })
      : res.status(404).json({ message: "Data Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong ", status: false });
  }
};

export const viewByIdShapping = async (req, res, next) => {
  try {
    const shapping = await Shapping.findById(req.params.id);
    return shapping
      ? res
          .status(200)
          .json({ message: "Data Found Successfully", shapping, status: true })
      : res.status(404).json({ message: "Data Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong", status: false });
  }
};

export const updateShapping = async (req, res, next) => {
  try {
    const updateData = req.body;
    const shapping = await Shapping.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    return shapping
      ? res
          .status(200)
          .json({ message: "Data Updated Successfully", status: true })
      : res.status(404).json({ message: "Data Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Someting Went Wrong", status: false });
  }
};

export const deleteShapping = async (req, res, next) => {
  try {
    const shapping = await Shapping.findByIdAndDelete(req.params.id);
    return shapping
      ? res.status(200).json({
          message: "Data Deleted Successfully",
          shapping,
          status: true,
        })
      : res.status(404).json({ message: "Data Not Deleted", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong", status: false });
  }
};
