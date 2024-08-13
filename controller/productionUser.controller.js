import { productUser } from "../model/productionUser.model.js";

export const createUser = async (req, res, next) => {
  try {
    const User = await productUser.create(req.body);
    return User
      ? res.status(200).json({ messae: "User Added", User, status: true })
      : res
          .status(404)
          .json({ message: "Something Went Wrong", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewUser = async (req, res, next) => {
  try {
    const User = await productUser.find({}).sort({ sortorder: -1 });
    return User.length > 0
      ? res.status(200).json({ message: "Data Found", User, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewByIdUser = async (req, res, next) => {
  try {
    const User = await productUser.findById(req.params.id);
    return User
      ? res.status(200).json({ message: "Data Found", User, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const User = await productUser.findById(id);
    if (!User) {
      res.status(404).json({ message: "Not Found", status: false });
    }
    const updatedData = req.body;
    await productUser.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ message: "Data Updated", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const User = await productUser.findById(id);
    if (!User) {
      res.status(404).json({ message: "Not Found", status: false });
    }
    await productUser.findByIdAndDelete(id);
    res.status(200).json({ message: "Data Deleted", User, status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};
