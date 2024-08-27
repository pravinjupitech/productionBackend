import { ProductionPurchaseOrder } from "../model/productionCreatePurchaseOrder.model.js";

export const CreateOrder = async (req, res, next) => {
  try {
    const order = await ProductionPurchaseOrder.create(req.body);
    return order
      ? res.status(200).json({ message: "Order Created", order, status: true })
      : res
          .status(404)
          .json({ message: "Something Went Wrong", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewOrder = async (req, res, next) => {
  try {
    const order = await ProductionPurchaseOrder.find({}).sort({
      sortorder: -1,
    });0
    return order.length > 0
      ? res.status(200).json({ message: "Data Found", order, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewByIdOrder = async (req, res, next) => {
  try {
    const order = await ProductionPurchaseOrder.findById(req.params.id);
    return order
      ? res.status(200).json({ message: "Data Found", order, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    const order = await ProductionPurchaseOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    const updatedData = req.body;
    await ProductionPurchaseOrder.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.status(200).json({ message: "Data Updated", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    const order = await ProductionPurchaseOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    await ProductionPurchaseOrder.findByIdAndDelete(id);
    res.status(200).json({ message: "Data Deleted", order, status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
