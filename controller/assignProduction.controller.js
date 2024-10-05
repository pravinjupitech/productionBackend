import { AssignProduction } from "../model/assignProduction.model.js";
import { RowProduct } from "../model/rowProduct.model.js";
import { StepsModel } from "../model/steps.model.js";
import { Warehouse } from "../model/warehouse.model.js";

export const assignProduct = async (req, res, next) => {
  try {
    // const { currentStep, processName, product_details } = req.body;
    // const productsteps = await StepsModel.findOne({ processName: processName });
    // if (productsteps.steps[0]._id.toString() === currentStep) {
    //   product_details.forEach((item) => {
    //     if (item.rProduct_name) {
    //       console.log("risings");
    //     }
    //   });
    // } else {
    //   product_details.forEach(async (item) => {
    //     if (item.rProduct_name) {
    //       const Rowproduct = await RowProduct.findById(item.rProduct_name);
    //       item.fProduct_name_Units.map((item) => {
    //         console.log(item);
    //         console.log(item.unit);
    //         if (item.unit == Rowproduct.stockUnit) {
    //           // console.log("how are you");
    //         }
    //       });
    //     }
    //   });
    // }

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
    const product = await AssignProduction.find({
      database: req.params.database,
    })
      .sort({ sortorder: -1 })
      .populate({ path: "user_name", model: "user" })
      .populate({
        path: "user_name",
        model: "user",
      })
      .populate({ path: "product_details.fProduct_name", model: "product" })
      .populate({ path: "processName", model: "category" });
    return product.length > 0
      ? res.status(200).json({ message: "Data Found", product, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewByIdProduct = async (req, res, next) => {
  try {
    const product = await AssignProduction.findById(req.params.id).populate({
      path: "user_name",
      model: "user",
    });
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
    let id = req.params.id;
    const product = await AssignProduction.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    const updateData = req.body;
    await AssignProduction.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Data Updated", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await AssignProduction.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    await AssignProduction.findByIdAndDelete(id);
    res.status(200).json({ message: "Data Deleted", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewByIdProduct2 = async (req, res, next) => {
  try {
    const product = await AssignProduction.findById(req.params.id)
      .populate({
        path: "user_name",
        model: "user",
      })
      .populate({ path: "product_details.fProduct_name", model: "rowProduct" })
      .populate({ path: "product_details.rProduct_name", model: "rowProduct" })
      .populate({ path: "product_details.wProduct_name", model: "rowProduct" })
      .populate({ path: "processName", model: "category" });
    return product
      ? res.status(200).json({ message: "Data Found", product, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const productionWarehouse = async (
  productData,
  warehouseId,
  productId
) => {
  try {
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res
        .status(404)
        .json({ message: "warehouse not found", status: false });
    }
    const sourceProductItem = warehouse.productItems.find(
      (pItem) => pItem.productId === productId
    );
    if (sourceProductItem) {
      sourceProductItem.currentStock = productData.qty;
      sourceProductItem.transferQty = productData.qty;
      warehouse.markModified("productItems");
      await warehouse.save();
    }
  } catch (error) {
    console.log(error);
  }
};

export const demoProduct = async (req, res, next) => {
  try {
    let arr = [1, 2, 3, 3, 4, 5, 5, 5];
    let frequency = {};
    let repeatedNumbers = [];
    for (let num of arr) {
      frequency[num] = (frequency[num] || 0) + 1;
    }
    for (let num in frequency) {
      if (frequency[num] > 1) {
        repeatedNumbers.push(Number(num));
      }
    }
    console.log("Repeated numbers:", repeatedNumbers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

/*
The event loop is a core concept in JavaScript, particularly in how asynchronous operations are handled. JavaScript is single-threaded, meaning it can execute only one task at a time. However, with the event loop, it can manage asynchronous tasks like I/O operations, timers, and callbacks without blocking the main thread. call stack and callback queue.to 
 
package.json->  This file lists the metadata for your project, including the project name, version, description, and dependencies.
while package-lock.json This file locks the exact versions of every installed package, including their sub-dependencies. 

In summary, package.json is a high-level overview of the project and its dependencies, while package-lock.json locks down the exact versions of those dependencies for reproducibility and consistency.

*/
