import { RawProductTarget } from "../model/rawProductTarget.model.js";

export const saveTarget = async (req, res, next) => {
  try {
    const target = await RawProductTarget.create(req.body);
    return target
      ? res.status(200).json({ message: "Data Added", status: true })
      : res
          .status(404)
          .json({ message: "Something went Wrong", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewAllTarget = async (req, res, next) => {
  try {
    const { database } = req.params;
    const target = await RawProductTarget.find({ database });
    return target.length > 0
      ? res.status(200).json({ message: "Data Found", target, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
};

export const viewByIdTarget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await RawProductTarget.findById(id);
    return target
      ? res.status(200).json({ message: "Data Found", target, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const updateTarget = async (req, res, next) => {
  try {
    const { id, innerId } = req.params;
    const existingProduct = await RawProductTarget.findById(id);
    if (existingProduct) {
      const findIndex = existingProduct.Target.findIndex(
        (item) => item._id.toString() === innerId
      );
      if (findIndex !== -1) {
        existingProduct.Target[findIndex] = {
          ...existingProduct.Target[findIndex]._doc,
          ...req.body,
        };
        await existingProduct.save();
        return res
          .status(200)
          .json({ message: "Data Updated Successfully", status: true });
      } else {
        return res
          .status(404)
          .json({ error: "Inner Data Not Found", status: false });
      }
    } else {
      return res.status(404).json({ error: "Not Found", status: false });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
};

export const deleteTarget = async (req, res, next) => {
  try {
    const { id, innerId } = req.params;
    const existingProduct = await RawProductTarget.findById(id);
    if (existingProduct) {
      const findIndex = existingProduct.Target.findIndex(
        (item) => item._id.toString() === innerId
      );
      if (findIndex !== -1) {
        existingProduct.Target.splice(findIndex, 1);
        await existingProduct.save();
        if (existingProduct.Target.length === 0) {
          await RawProductTarget.findByIdAndDelete(id);
          return res.status(200).json({
            message: "Parent data deleted because no steps remain",
            status: true,
          });
        }
        return res
          .status(200)
          .json({ message: "Inner data deleted successfully", status: true });
      } else {
        return res
          .status(404)
          .json({ error: "Inner data not found", status: false });
      }
    } else {
      return res
        .status(404)
        .json({ error: "Parent data not found", status: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
