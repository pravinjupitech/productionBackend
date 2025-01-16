import multer, { diskStorage } from "multer";
import { AssignProduction } from "../model/assignProduction.model.js";
import { Product } from "../model/product.model.js";
import { RowProduct } from "../model/rowProduct.model.js";
import { StartProduction } from "../model/startProduction.model.js";
import { StepsModel } from "../model/steps.model.js";
import { Warehouse } from "../model/warehouse.model.js";

export const assignProduct = async (req, res, next) => {
  try {
    const { currentStep, processName, product_details } = req.body;
    const productsteps = await StepsModel.findOne({ processName: processName });
    if (!productsteps) {
      return res
        .status(404)
        .json({ message: "Process Not Found", status: false });
    }

    // const exitingData = await AssignProduction.findOne({ processName });
    // if (exitingData.step_name === step_name) {
    //   return res
    //     .status(404)
    //     .json({ message: "Already Step Created", status: false });
    // }

    const isFirstStep = productsteps.steps[0]._id.toString() === currentStep;
    const isLastStep =
      productsteps.steps[productsteps.steps.length - 1]._id.toString() ===
      currentStep;
    for (const item of product_details) {
      if (item?.rProduct_name.length > 0 && item?.rProduct_name) {
        if (isFirstStep) {
          await updateProductQty(
            item?.rProduct_name,
            item?.rProduct_name_Units,
            "deduct",
            "Product",
            res
          );
        } else {
          await updateProductQty(
            item?.rProduct_name,
            item?.rProduct_name_Units,
            "deduct",
            "RowProduct",
            res
          );
        }
      }
      if (item?.fProduct_name.length > 0 && item?.fProduct_name) {
        if (isLastStep) {
          await updateProductQty(
            item?.fProduct_name,
            item?.fProduct_name_Units,
            "add",
            "Product",
            res
          );
        } else {
          await updateProductQty(
            item?.fProduct_name,
            item?.fProduct_name_Units,
            "add",
            "RowProduct",
            res
          );
        }
      }
      if (item?.wProduct_name.length > 0 && item.wProduct_name) {
        await updateProductQty(
          item?.wProduct_name,
          item?.wProduct_name_Units,
          "add",
          "RowProduct",
          res
        );
      }
    }
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

const updateProductQty = async (
  productId,
  productUnits,
  actionType,
  modelType,
  res
) => {
  const ProductModel = modelType === "Product" ? Product : RowProduct;
  const product = await ProductModel?.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ message: "Product not found", status: false });
  }

  for (const unit of productUnits) {
    if (unit.unit === product.stockUnit) {
      if (actionType === "deduct") {
        product.qty -= unit.value;
        await product.save();
        await productionlapseWarehouse(
          unit.value,
          product.warehouse,
          productId
        );
      } else if (actionType === "add") {
        product.qty += unit.value;
        await product.save();
        await productionAddWarehouse(unit.value, product.warehouse, productId);
      }
    }
  }
};

export const viewProduct = async (req, res, next) => {
  try {
    const product = await AssignProduction.find({
      database: req.params.database,
    })
      .sort({ sortorder: -1 })
      .populate({ path: "user_name", model: "user" });
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
    const id = req.params.id;
    const Productfind = await AssignProduction.findById(id);
    if (!Productfind) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    const { product_details } = req.body;
    const productsteps = await StepsModel.findOne({
      processName: Productfind.processName,
    });
    if (!productsteps) {
      return res
        .status(404)
        .json({ message: "Process Not Found", status: false });
    }

    const processRowProductUpdate = async (item, productType, typeUnits) => {
      if (item[productType] !== null) {
        const Rowproduct = await RowProduct.findById(item[productType]);
        if (Rowproduct) {
          await Promise.all(
            item[typeUnits].map(async (data) => {
              if (data.unit === Rowproduct.stockUnit) {
                const existingProduct = Productfind.product_details.find(
                  (existingItem) =>
                    existingItem[productType] === item[productType]
                );

                if (existingProduct) {
                  const existingUnit = existingProduct[typeUnits].find(
                    (exitingData) => exitingData.unit === data.unit
                  );

                  if (existingUnit) {
                    let qty;
                    if (data.value > existingUnit.value) {
                      qty = data.value - existingUnit.value;
                      Rowproduct.qty +=
                        productType === "rProduct_name" ? -qty : qty;
                      // console.log("RowProduct", Rowproduct, productType);
                      // console.log("lapseQty", Rowproduct.qty);
                      if (productType === "rProduct_name") {
                        await productionlapseWarehouse(
                          qty,
                          Rowproduct.warehouse,
                          item[productType]
                        );
                      } else {
                        await productionAddWarehouse(
                          qty,
                          Rowproduct.warehouse,
                          item[productType]
                        );
                      }
                    } else if (data.value < existingUnit.value) {
                      qty = existingUnit.value - data.value;
                      Rowproduct.qty +=
                        productType === "rProduct_name" ? qty : -qty;
                      // console.log("RowProduct", Rowproduct, productType);
                      // console.log("addQty", Rowproduct.qty);
                      if (productType === "rProduct_name") {
                        await productionAddWarehouse(
                          qty,
                          Rowproduct.warehouse,
                          item[productType]
                        );
                      } else {
                        await productionlapseWarehouse(
                          qty,
                          Rowproduct.warehouse,
                          item[productType]
                        );
                      }
                    }
                    await Rowproduct.save();
                  }
                }
              }
            })
          );
        }
      }
    };

    const processRProductUpdate = async (item, productType, typeUnits) => {
      if (item[productType] !== null) {
        const ProductModel = await Product.findById(item[productType]);
        if (ProductModel) {
          await Promise.all(
            item[typeUnits].map(async (data) => {
              const existingProduct = Productfind.product_details.find(
                (existingItem) =>
                  existingItem[productType] === item[productType]
              );
              if (existingProduct) {
                const existingUnit = existingProduct[typeUnits].find(
                  (exitingData) => exitingData.unit === data.unit
                );
                if (existingUnit) {
                  let qty;
                  if (data.value > existingUnit.value) {
                    qty = data.value - existingUnit.value;
                    ProductModel.qty += qty;
                    await productionlapseWarehouse(
                      qty,
                      ProductModel.warehouse,
                      item[productType]
                    );
                  } else if (data.value < existingUnit.value) {
                    qty = existingUnit.value - data.value;
                    ProductModel.qty -= qty;
                    await productionAddWarehouse(
                      qty,
                      ProductModel.warehouse,
                      item[productType]
                    );
                  }
                  await ProductModel.save();
                }
              }
            })
          );
        }
      }
    };

    const updateProductDetails = async (isFirstStep, isLastStep) => {
      await Promise.all(
        product_details.map(async (item) => {
          if (isFirstStep) {
            await processRProductUpdate(
              item,
              "rProduct_name",
              "rProduct_name_Units"
            );
          } else {
            await processRowProductUpdate(
              item,
              "rProduct_name",
              "rProduct_name_Units"
            );
          }
          if (isLastStep) {
            await processRProductUpdate(
              item,
              "fProduct_name",
              "fProduct_name_Units"
            );
          } else {
            await processRowProductUpdate(
              item,
              "fProduct_name",
              "fProduct_name_Units"
            );
          }
          await processRowProductUpdate(
            item,
            "wProduct_name",
            "wProduct_name_Units"
          );
        })
      );
    };
    const isFirstStep =
      productsteps.steps[0]._id.toString() === Productfind.currentStep;
    const isLastStep =
      productsteps.steps[productsteps.steps.length - 1]._id.toString() ===
      Productfind.currentStep;
    await updateProductDetails(isFirstStep, isLastStep);
    const updateData = req.body;
    await AssignProduction.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Data Updated", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
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

export const productionlapseWarehouse = async (qty, warehouseId, productId) => {
  try {
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res
        .status(404)
        .json({ message: "warehouse not found", status: false });
    }
    const sourceProductItem = warehouse.productItems.find(
      (pItem) => pItem.productId.toString() === productId.toString()
    );
    if (sourceProductItem) {
      sourceProductItem.currentStock -= qty;
      sourceProductItem.transferQty -= qty;
      warehouse.markModified("productItems");
      await warehouse.save();
    }
  } catch (error) {
    console.log(error);
  }
};

export const productionAddWarehouse = async (qty, warehouseId, productId) => {
  try {
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res
        .status(404)
        .json({ message: "warehouse not found", status: false });
    }
    const sourceProductItem = warehouse.productItems.find(
      (pItem) => pItem.productId.toString() === productId.toString()
    );
    if (sourceProductItem) {
      sourceProductItem.currentStock += qty;
      sourceProductItem.transferQty += qty;
      warehouse.markModified("productItems");
      await warehouse.save();
    }
  } catch (error) {
    console.log(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    let id = req.params.id;
    const Productfind = await AssignProduction.findById(id);
    if (!Productfind) {
      return res.status(404).json({ message: "Not Found", status: false });
    }

    const productsteps = await StepsModel.findOne({
      processName: Productfind.processName,
    });
    if (!productsteps) {
      return res
        .status(404)
        .json({ message: "Process Not Found", status: false });
    }

    const isFirstStep =
      productsteps.steps[0]._id.toString() === Productfind.currentStep;
    const isLastStep =
      productsteps.steps[productsteps.steps.length - 1]._id.toString() ===
      Productfind.currentStep;

    for (const item of Productfind.product_details) {
      await handleProductRevert(item, isFirstStep, isLastStep);
    }

    await AssignProduction.findByIdAndDelete(id);
    res.status(200).json({ message: "Product Deleted ", status: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

const handleProductRevert = async (item, isFirstStep, isLastStep) => {
  const modelType = isFirstStep ? Product : RowProduct;
  const modelType1 = isLastStep ? Product : RowProduct;

  if (
    item.rProduct_name &&
    Array.isArray(item.rProduct_name_Units) &&
    item.rProduct_name_Units.length > 0
  ) {
    const Rowproduct = await modelType.findById(item.rProduct_name);
    await revertStockUnits(item?.rProduct_name_Units, Rowproduct, "add");
  }
  if (
    item.fProduct_name &&
    Array.isArray(item.fProduct_name_Units) &&
    item.fProduct_name_Units.length > 0
  ) {
    const Rowproduct = await modelType1.findById(item.fProduct_name);
    await revertStockUnits(item?.fProduct_name_sUnits, Rowproduct, "deduct");
  }

  if (
    item.wProduct_name &&
    Array.isArray(item.wProduct_name_Units) &&
    item.wProduct_name_Units.length > 0
  ) {
    const Rowproduct = await RowProduct.findById(item.wProduct_name);
    await revertStockUnits(item?.wProduct_name_Units, Rowproduct, "deduct");
  }
};
const revertStockUnits = async (units, product, actionType) => {
  if (Array.isArray(units)) {
    for (const unit of units) {
      if (unit.unit === product.stockUnit) {
        product.qty =
          actionType === "add"
            ? product.qty + unit.value
            : product.qty - unit.value;
        await product.save();
        await (actionType === "add"
          ? productionAddWarehouse(unit.value, product.warehouse, product._id)
          : productionlapseWarehouse(
              unit.value,
              product.warehouse,
              product._id
            ));
      }
    }
  } else {
    console.error("Expected 'units' to be an array, but got:", units);
  }
};

export const assignProducted = async (req, res, next) => {
  try {
    const { currentStep, processName, product_details } = req.body;
    const productsteps = await StepsModel.findOne({ processName: processName });
    if (!productsteps) {
      return res
        .status(404)
        .json({ message: "Proccess Not Found", status: "false" });
    }
    if (productsteps.steps[0]._id.toString() === currentStep) {
      if (item.rProduct_name) {
        product_details.forEach(async (item) => {
          if (item?.rProduct_name) {
            const Rowproduct = await Product.findById(item.rProduct_name);
            item.rProduct_name_Units.map(async (data) => {
              if (data.unit === Rowproduct.stockUnit) {
                Rowproduct.qty -= data.value;
                await Rowproduct.save();
                await productionlapseWarehouse(
                  data.value,
                  Rowproduct.warehouse,
                  item.rProduct_name
                );
              }
            });
          }
        });
      }
      if (item?.fProduct_name) {
        const Rowproduct = await RowProduct.findById(item.fProduct_name);
        item.fProduct_name_Units.map(async (data) => {
          if (data.unit === Rowproduct.stockUnit) {
            Rowproduct.qty += data.value;
            await Rowproduct.save();
            await productionAddWarehouse(
              data.value,
              Rowproduct.warehouse,
              item.fProduct_name
            );
          }
        });
      }
      if (item?.wProduct_name) {
        const Rowproduct = await RowProduct.findById(item.wProduct_name);
        item.wProduct_name_Units.map(async (data) => {
          if (data.unit === Rowproduct.stockUnit) {
            Rowproduct.qty += data.value;
            await Rowproduct.save();
            await productionAddWarehouse(
              data.value,
              Rowproduct.warehouse,
              item.wProduct_name
            );
          }
        });
      }
    } else {
      product_details.forEach(async (item) => {
        if (item?.rProduct_name) {
          const Rowproduct = await RowProduct.findById(item.rProduct_name);
          item.rProduct_name_Units.map(async (data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Rowproduct.qty -= data.value;
              await Rowproduct.save();
              await productionlapseWarehouse(
                data.value,
                Rowproduct.warehouse,
                item.rProduct_name
              );
            }
          });
        }
        if (item?.fProduct_name) {
          const Rowproduct = await RowProduct.findById(item.fProduct_name);
          item.fProduct_name_Units.map(async (data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Rowproduct.qty += data.value;
              await Rowproduct.save();
              await productionAddWarehouse(
                data.value,
                Rowproduct.warehouse,
                item.fProduct_name
              );
            }
          });
        }
        if (item?.wProduct_name) {
          const Rowproduct = await RowProduct.findById(item.wProduct_name);
          item.wProduct_name_Units.map(async (data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Rowproduct.qty += data.value;
              await Rowproduct.save();
              await productionAddWarehouse(
                data.value,
                Rowproduct.warehouse,
                item.wProduct_name
              );
            }
          });
        }
      });
    }
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

export const updateProducted = async (req, res, next) => {
  try {
    let id = req.params.id;
    const Productfind = await AssignProduction.findById(id);
    if (!Productfind) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    const { product_details } = req.body;
    const productsteps = await StepsModel.findOne({
      processName: Productfind.processName,
    });
    if (!productsteps) {
      return res
        .status(404)
        .json({ message: "Proccess Not Found", status: "false" });
    }
    if (productsteps.steps[0]._id.toString() === Productfind.currentStep) {
      product_details.map(async (item) => {
        if (item.rProduct_name !== null) {
          const Rowproduct = await Product.findById(item.rProduct_name);
          item.rProduct_name_Units.map((data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Productfind.product_details.map(async (exitingItem) => {
                exitingItem.rProduct_name_Units.map(async (exitingData) => {
                  if (exitingData.unit == data.unit) {
                    if (data.value > exitingData.value) {
                      let qty = data.value - exitingData.value;
                      Rowproduct.qty -= qty;
                      // console.log("updateDatar", data.value);
                      // console.log("exitingDatar", exitingData.value);
                      // console.log("currentDatar", qty);
                      await productionlapseWarehouse(
                        qty,
                        Rowproduct.warehouse,
                        item.rProduct_name
                      );
                      await Rowproduct.save();
                    } else if (data.value == exitingData.value) {
                      return;
                    } else {
                      let qty = exitingData.value - data.value;
                      Rowproduct.qty += qty;
                      // console.log("updateDataasdd", data.value);
                      // console.log("exitingDatadf", exitingData.value);
                      // console.log("currentData", qty);
                      await productionAddWarehouse(
                        qty,
                        Rowproduct.warehouse,
                        item.rProduct_name
                      );
                      await Rowproduct.save();
                    }
                  }
                });
              });
            }
          });
        }
        if (item.fProduct_name !== null) {
          const Rowproduct = await RowProduct.findById(item.fProduct_name);
          item.fProduct_name_Units.map((data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Productfind.product_details.map(async (exitingItem) => {
                exitingItem.fProduct_name_Units.map(async (exitingData) => {
                  if (exitingData.unit == data.unit) {
                    if (data.value > exitingData.value) {
                      let qty = data.value - exitingData.value;
                      Rowproduct.qty += qty;
                      await productionAddWarehouse(
                        qty,
                        Rowproduct.warehouse,
                        item.fProduct_name
                      );
                      await Rowproduct.save();
                    } else if (data.value == exitingData.value) {
                      return;
                    } else {
                      let qty = exitingData.value - data.value;
                      Rowproduct.qty -= qty;
                      await productionlapseWarehouse(
                        qty,
                        Rowproduct.warehouse,
                        item.fProduct_name
                      );
                      await Rowproduct.save();
                    }
                  }
                });
              });
            }
          });
        }
        if (item.wProduct_name !== null) {
          const Rowproduct = await RowProduct.findById(item.wProduct_name);
          item.wProduct_name_Units.map((data) => {
            if (data.unit === Rowproduct.stockUnit) {
              if (data.unit === Rowproduct.stockUnit) {
                Productfind.product_details.map(async (exitingItem) => {
                  exitingItem.wProduct_name_Units.map(async (exitingData) => {
                    if (exitingData.unit == data.unit) {
                      // console.log(exitingData.unit);
                      // console.log(exitingData.value, data.value);
                      if (data.value > exitingData.value) {
                        let qty = data.value - exitingData.value;
                        Rowproduct.qty += qty;
                        await productionAddWarehouse(
                          qty,
                          Rowproduct.warehouse,
                          item.wProduct_name
                        );
                        await Rowproduct.save();
                      } else if (data.value == exitingData.value) {
                        return 0;
                      } else {
                        let qty = exitingData.value - data.value;
                        Rowproduct.qty -= qty;
                        await productionlapseWarehouse(
                          qty,
                          Rowproduct.warehouse,
                          item.wProduct_name
                        );
                        await Rowproduct.save();
                      }
                    }
                  });
                });
              }
            }
          });
        }
      });
    } else {
      product_details.map(async (item) => {
        if (item.rProduct_name !== null) {
          const Rowproduct = await RowProduct.findById(item.rProduct_name);
          item.rProduct_name_Units.map((data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Productfind.product_details.map(async (exitingItem) => {
                exitingItem.rProduct_name_Units.map(async (exitingData) => {
                  if (exitingData.unit == data.unit) {
                    if (data.value > exitingData.value) {
                      let qty = data.value - exitingData.value;
                      Rowproduct.qty -= qty;
                      // console.log("updateDatar", data.value);
                      // console.log("exitingDatar", exitingData.value);
                      // console.log("currentDatar", qty);
                      await productionlapseWarehouse(
                        qty,
                        Rowproduct.warehouse,
                        item.rProduct_name
                      );
                      await Rowproduct.save();
                    } else if (data.value == exitingData.value) {
                      return;
                    } else {
                      let qty = exitingData.value - data.value;
                      Rowproduct.qty += qty;
                      // console.log("updateDataasdd", data.value);
                      // console.log("exitingDatadf", exitingData.value);
                      // console.log("currentData", qty);
                      await productionAddWarehouse(
                        qty,
                        Rowproduct.warehouse,
                        item.rProduct_name
                      );
                      await Rowproduct.save();
                    }
                  }
                });
              });
            }
          });
        }
        if (item.fProduct_name !== null) {
          const Rowproduct = await RowProduct.findById(item.fProduct_name);
          item.fProduct_name_Units.map((data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Productfind.product_details.map(async (exitingItem) => {
                exitingItem.fProduct_name_Units.map(async (exitingData) => {
                  if (exitingData.unit === data.unit) {
                    // console.log(exitingData.unit);
                    // console.log(exitingData.value, data.value);
                    if (data.value > exitingData.value) {
                      let qty = data.value - exitingData.value;
                      Rowproduct.qty += qty;
                      await Rowproduct.save();
                      await productionAddWarehouse(
                        qty,
                        Rowproduct.warehouse,
                        item.fProduct_name
                      );
                    } else if (data.value == exitingData.value) {
                      return;
                    } else {
                      let qty = exitingData.value - data.value;
                      // console.log("exitingData.value", exitingData.value);
                      // console.log("data.value", data.value);
                      // console.log("qty", qty);
                      Rowproduct.qty -= qty;
                      await Rowproduct.save();
                      await productionlapseWarehouse(
                        qty,
                        Rowproduct.warehouse,
                        item.fProduct_name
                      );
                    }
                  }
                });
              });
            }
          });
        }
        if (item?.wProduct_name) {
          const Rowproduct = await RowProduct.findById(item.wProduct_name);
          item.wProduct_name_Units.map((data) => {
            if (data.unit === Rowproduct.stockUnit) {
              if (data.unit === Rowproduct.stockUnit) {
                Productfind?.product_details.map(async (exitingItem) => {
                  exitingItem?.wProduct_name_Units.map(async (exitingData) => {
                    if (exitingData.unit == data.unit) {
                      if (data.value > exitingData.value) {
                        let qty = data.value - exitingData.value;
                        Rowproduct.qty += qty;
                        await Rowproduct.save();
                        await productionAddWarehouse(
                          qty,
                          Rowproduct.warehouse,
                          item.wProduct_name
                        );
                      } else if (data.value == exitingData.value) {
                        return;
                      } else {
                        let qty = exitingData.value - data.value;
                        Rowproduct.qty -= qty;
                        await Rowproduct.save();
                        await productionlapseWarehouse(
                          qty,
                          Rowproduct.warehouse,
                          item.wProduct_name
                        );
                      }
                    }
                  });
                });
              }
            }
          });
        }
      });
    }
    const updateData = req.body;
    await AssignProduction.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Data Updated", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const deleteProducted = async (req, res, next) => {
  try {
    let id = req.params.id;
    const Productfind = await AssignProduction.findById(id);
    if (!Productfind) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    const productsteps = await StepsModel.findOne({
      processName: Productfind.processName,
    });
    if (!productsteps) {
      return res
        .status(404)
        .json({ message: "Proccess Not Found", status: "false" });
    }
    if (productsteps.steps[0]._id.toString() === Productfind.currentStep) {
      Productfind.product_details.forEach(async (item) => {
        if (item.rProduct_name.length > 0 && item.rProduct_name) {
          const Rowproduct = await Product.findById(item.rProduct_name);
          item.rProduct_name_Units.map(async (data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Productfind.product_details.map((item1) => {
                item1.rProduct_name_Units.map(async (data1) => {
                  let qty = data1.value;
                  Rowproduct.qty += qty;
                  await Rowproduct.save();
                  await productionAddWarehouse(
                    qty,
                    Rowproduct.warehouse,
                    item.rProduct_name
                  );
                });
              });
            }
          });
        }
        if (item.fProduct_name.length > 0 && item.fProduct_name) {
          const Rowproduct = await RowProduct.findById(item.fProduct_name);
          item.fProduct_name_Units.map(async (data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Productfind.product_details.map((item1) => {
                item1.fProduct_name_Units.map(async (data1) => {
                  let qty = data1.value;
                  Rowproduct.qty -= qty;
                  await Rowproduct.save();
                  await productionlapseWarehouse(
                    qty,
                    Rowproduct.warehouse,
                    item.fProduct_name
                  );
                });
              });
            }
          });
        }
        if (item.wProduct_name.length > 0 && item.wProduct_name) {
          const Rowproduct = await RowProduct.findById(item.wProduct_name);
          item.wProduct_name_Units.map(async (data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Productfind.product_details.map((item1) => {
                item1.wProduct_name_Units.map(async (data1) => {
                  let qty = data1.value;
                  Rowproduct.qty -= qty;
                  await Rowproduct.save();
                  await productionlapseWarehouse(
                    qty,
                    Rowproduct.warehouse,
                    item.wProduct_name
                  );
                });
              });
            }
          });
        }
      });
    } else {
      Productfind.product_details.forEach(async (item) => {
        if (item.rProduct_name.length > 0 && item.rProduct_name) {
          const Rowproduct = await RowProduct.findById(item.rProduct_name);
          item.rProduct_name_Units.map(async (data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Productfind.product_details.map((item1) => {
                item1.rProduct_name_Units.map(async (data1) => {
                  let qty = data1.value;
                  Rowproduct.qty += qty;
                  await Rowproduct.save();
                  await productionAddWarehouse(
                    qty,
                    Rowproduct.warehouse,
                    item.rProduct_name
                  );
                });
              });
            }
          });
        }
        if (item.fProduct_name.length > 0 && item.fProduct_name) {
          const Rowproduct = await RowProduct.findById(item.fProduct_name);
          item.fProduct_name_Units.map(async (data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Productfind.product_details.map((item1) => {
                item1.fProduct_name_Units.map(async (data1) => {
                  let qty = data1.value;
                  Rowproduct.qty -= qty;
                  await Rowproduct.save();
                  await productionlapseWarehouse(
                    qty,
                    Rowproduct.warehouse,
                    item.fProduct_name
                  );
                });
              });
            }
          });
        }
        if (item.wProduct_name.length > 0 && item.wProduct_name) {
          const Rowproduct = await RowProduct.findById(item.wProduct_name);
          item.wProduct_name_Units.map(async (data) => {
            if (data.unit === Rowproduct.stockUnit) {
              Productfind.product_details.map((item1) => {
                item1.wProduct_name_Units.map(async (data1) => {
                  let qty = data1.value;
                  Rowproduct.qty -= qty;
                  await Rowproduct.save();
                  await productionlapseWarehouse(
                    qty,
                    Rowproduct.warehouse,
                    item.wProduct_name
                  );
                });
              });
            }
          });
        }
      });
    }
    await AssignProduction.findByIdAndDelete(id);
    res.status(200).json({ message: "Data Deleted", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};
//window.history.back()

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
    res.status(200).json({ message: "" });
    console.log("Repeated numbers: char is ", repeatedNumbers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const demoProduct2 = async (req, res, next) => {
  try {
    let arr = [
      { id: 1, price: 200 },
      { id: 1, price: 200 },
      { id: 2, price: 200 },
      { id: 1, price: 200 },
      { id: 2, price: 200 },
      { id: 3, price: 200 },
    ];

    let arr1 = [
      { id: 1, name: "production Manager" },
      { id: 2, name: "labour" },
      { id: 3, name: "Incharge" },
    ];

    let priceMap = arr.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = { id: item.id, price: 0 };
      }
      acc[item.id].price += item.price;
      return acc;
    }, {});
    let uniquePriceArray = Object.values(priceMap);
    let mergedArray = uniquePriceArray.map((item) => {
      let matchedItem = arr1.find((element) => element.id === item.id);
      return { ...item, ...matchedItem };
    });
    console.log(mergedArray);
    res.status(500).json({
      message: "",
      status: false,
    });
    console.log(
      "an enviroment var is key value pair used by operating system and applications to store configuration setting that affect the behavior of processes or programe . these var are part of system enviroment and can hold data like file paths , system preferance or sensitive information such as api keys  and password"
    );
    console.log(
      "$match: Filters documents (like WHERE in SQL).$group: Groups documents by a specified field and applies aggregate functions (e.g., SUM, AVG).$project: Shapes the documents, selecting specific fields or creating computed fields.$sort: Orders the documents.$limit and $skip: Control the number of documents.$lookup: Performs a left outer join with another collection.Aggregate Functions: Functions like sum, avg, min, max, and count can be applied within certain stages, such as $group."
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

/*


In MongoDB, aggregation is a powerful framework used to process, transform, and analyze data stored in collections. It allows you to perform complex queries and transformations on data, similar to SQL's GROUP BY, JOIN, and aggregate functions.

Key Concepts in Aggregation
Aggregation Pipeline: The aggregation framework operates as a pipeline, where data passes through a series of stages, and each stage performs an operation on the data. The output of one stage serves as the input for the next. 

Example stages:

$match: Filters documents (like WHERE in SQL).
$group: Groups documents by a specified field and applies aggregate functions (e.g., SUM, AVG).
$project: Shapes the documents, selecting specific fields or creating computed fields.
$sort: Orders the documents.
$limit and $skip: Control the number of documents.
$lookup: Performs a left outer join with another collection.
Aggregate Functions: Functions like sum, avg, min, max, and count can be applied within certain stages, such as $group.

Example Use Cases
Summarizing data (e.g., total sales per region).
Joining data from multiple collections using $lookup.
Transforming data, such as calculating derived fields.
Filtering and sorting data.



*/
