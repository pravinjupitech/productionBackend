import { StepsModel } from "../model/steps.model.js";

export const createSteps = async (req, res, next) => {
  try {
    const steps = await StepsModel.create(req.body);
    return steps
      ? res.status(200).json({ message: "Data Added", status: true })
      : res
          .status(404)
          .json({ message: "Something Went Wrong", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewSteps = async (req, res, next) => {
  try {
    const steps = await StepsModel.find();
    return steps.length > 0
      ? res.status(200).json({ message: "Data Found", steps, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewbyIdSteps = async (req, res, next) => {
  try {
    const id = req.params.id;
    const steps = await StepsModel.findById(id);
    return steps
      ? res.status(200).json({ message: "Data Found", steps, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const updateSteps = async (req, res, next) => {
  try {
    const id = req.params.id;
    const steps = await StepsModel.findById(id);
    if (!steps) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    const updatedData = req.body;
    await StepsModel.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ message: "Data Updated", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const deleteSteps = async (req, res, next) => {
  try {
    const id = req.params.id;
    const steps = await StepsModel.findById(id);
    if (!steps) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    await StepsModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Data Deleted", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
