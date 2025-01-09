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
