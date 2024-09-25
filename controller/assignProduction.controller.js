import { AssignProduction } from "../model/assignProduction.model.js";

export const assignProduct = async (req, res, next) => {
  try {
    const product = await AssignProduction.create(req.body);
    return product
      ? res.status(200).json({ message: "Data Added", status: true })
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
    const product = await AssignProduction.find({}).sort({ sortorder: -1 });
    return product.length > 0
      ? res.status(200).json({ message: "Data Found", product, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
