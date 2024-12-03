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
      .populate({ path: "user_name", model: "user" })
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
                        return;
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
// window.history.back()
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
    console.log("Repeated numbers: char is ", repeatedNumbers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const demoProduct2 = async (req, res, next) => {
  try {
    if (req.body.processName) {
      return res.status(404).json({
        message:
          "worker threads, cluster module ,external module ka use karke bana sakte hai worker threads ko computationally heavy tasks while cluster module use when than server scable on multiple cores",
      });
    }
    const { id } = req.params;
    const exitingData = await StartProduction.findById(id);
    if (!exitingData) {
      return res.status(404).json({ message: "Data Not Found", status: false });
    }
    console.log(exitingData);
    res.status(404).json({ message: "" });
    console.log("", req.body);
    const { product_details } = req.body;
    for (let item of product_details) {
      console.log(item.rProduct_name);
      return res.json({ message: "Internal Server Error", status: false });
    }
    const updatedData = req.body;
    await StartProduction.findByIdAndUpdate(id, updatedData, { new: true });
    return res.status(200).json({ message: "Data Updated ", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

/*







I can come for the interview
but there is no problem .you teach me.
I will think about it and tell you
Authentication is user identity verify on system and authorization is user and system allowed to do.

let arr = [1, 2, 3, 4, 5, 3, 2];
let arr1 = [1, 45, 32, 4, 3, 12, 47];
let unique = new Set();

for (let i = 0; i < arr.length; i++) {
  for (let j = 0; j < arr1.length; j++) {
    if (arr[i] === arr1[j]) {
      unique.add(arr[i]);
    }
  }
}

console.log([...unique]);

    function fact(n) {
      if (n == 1 || n == 0) {
        return 1;
      }
      return n * fact(n - 1);
    }
    console.log(fact(5));

    function fib(n) {
      if (n <= 1) {
        return n;
      }
      return fib(n - 1) + fib(n - 2);
    }
    for (let i = 0; i < 10; i++) {
      console.log(fib(i));
    }

 function longestfix(arr){
 if(arr.length===0)return "";
 arr.sort();
 let first=arr[0];
 let last=arr[arr.length-1]
 let i=0;
 while(i<first.length&&first[i]===last[i]){  
 i++;
 }
 return first.substring(0,i)
 }

 let arr=["flower","flow","flight"]
 console.log(longestfix(arr))

 arr=["dog","recer","car"];
  console.log(longestfix(arr))











The following query will be used to get top 10 rows.

SELECT * FROM table_name LIMIT 0,10;

There are three types of relationships used in MySQL.

One-to-one: Elements with a one to one relationship can be included as columns in the table.

One-to-many: One to many or many to one relationships both are same. It will occur when one row in a table is related to multiple rows in different table.

Many-to-many: Many rows in a table are related to many rows in different table is called many to many relationship.

Joins are used to connect two or more tables. It returns only same values in all tables.

There are four different ways to join MySQL tables.

Inner Join
left Join
Right Join
Full Join     join in 4 types inner right left full join two or more table connected 

There are 16 indexed columns can be created in a table.

‘_’ corresponds to only one character but ‘%’ corresponds to zero or more characters in the LIKE statement.

LENGTH is byte count whereas CHAR_LENGTH is character count. The numbers are the same for Latin characters but different for Unicode and other encodings.

SELECT CHAR_LENGTH(column_name) FROM table_name;
SELECT LENGTH(column_name) FROM table_name;

Storage and retrieval have been different for CHAR and VARCHAR.   
Column length is fixed in CHAR but VARCHAR length is variable.
CHAR is faster than VARCHAR.
CHAR datatype can hold a maximum of 255 characters while VARCHAR can store up to 4000 characters.

There are 5 types of tables present in MySQL.

Heap table
merge table
MyISAM table
INNO DB table
ISAM table

3306 is MySQL server‘s default port.

Friend Function ->A friend function is a function that is not a member of a class but has access to its private and protected members. Declaring a function as a friend inside a class allows it to bypass the usual access control restrictions. 

Pure virtual Function->A pure virtual function, also known as an abstract function is a member function that doesn’t contain any statements. This function is defined in the derived class if needed.

Virtual Function -> A virtual function is a function that is used to override a method of the parent class in the derived class. It is used to provide abstraction in a class.

In C++, a virtual function is declared using the virtual keyword,

Constructor-> it is initlize of object of class . four types constructor default constructor , parameterized constructor , copy constructor , move constructor

destucuctor->A destructor is a method that is automatically called when the object is made of scope or destroyed.
In C++, the destructor name is also the same as the class name but with the (~) tilde symbol as the prefix.

class is a blue print and template and object is instance of class .
main concept of oops are four pillers 1. data abstraction , incapsulation, inheritance , polymorphrism ,

1. incapsulation ->Encapsulation is the binding of data and methods that manipulate them into a single unit such that the sensitive data is hidden from the users
It is implemented as the processes mentioned below:

Data hiding: A language feature to restrict access to members of an object. For example, private and protected members in C++.
Bundling of data and methods together: Data and methods that operate on that data are bundled together. For example, the data members and member methods that operate on them are wrapped into a single unit known as a class.

2. Abstraction ->Abstraction is similar to data encapsulation and is very important in OOP. It means showing only the necessary information and hiding the other irrelevant information from the user. Abstraction is implemented using classes and interfaces.

3. Polymorphism->The word “Polymorphism” means having many forms. It is the property of some code to behave differently for different contexts. For example, in C++ language, we can define multiple functions having the same name but different working depending on the context.

Polymorphism can be classified into two types based on the time when the call to the object or function is resolved. They are as follows:

Compile Time Polymorphism
Runtime Polymorphism
A) Compile-Time Polymorphism     

Compile time polymorphism, also known as static polymorphism or early binding is the type of polymorphism where the binding of the call to its code is done at the compile time. Method overloading or operator overloading are examples of compile-time polymorphism. like ->function overloading

B) Runtime Polymorphism

Also known as dynamic polymorphism or late binding, runtime polymorphism is the type of polymorphism where the actual implementation of the function is determined during the runtime or execution. Method overriding is an example of this method. like-> function overiding

4. Inheritance->The idea of inheritance is simple, a class is derived from another class and uses data and implementation of that other class. The class which is derived is called child or derived or subclass and the class from which the child class is derived is called parent or base or superclass.

The main purpose of Inheritance is to increase code reusability. It is also used to achieve Runtime Polymorphism.  

types of Inheritance ->   Single Inheritance: A derived class inherits from one base class.

Multiple Inheritance: A derived class inherits from more than one base class.

Multilevel Inheritance: A class is derived from another derived class, forming a chain of inheritance.

Hierarchical Inheritance: Multiple derived classes inherit from the same base class.

Hybrid Inheritance: A combination of two or more types of inheritance (e.g., multiple and multilevel).

Virtual Inheritance:A special type used to prevent multiple "copies" of a base class when using multiple inheritance. Often used to resolve the diamond problem in inheritance.

Algorithms-> seqvence of steps to solve given problems
Data Structured->arrangement of data in main memory for efficient usage 
//stack me -> function call hot jayega vaise vaise function ko apni memory milti jayegi or execute hone ke bad khali hoti jayegi.
Pointer is stored of address      
//dynamic memory request c me malloc and c++ me new operator

array is time complexity of o(1),differance between array and list is array is static data structure and it is fixed and continueslty while list is dynamic data structure and it is grow and not required continuslty.

linked list is linear Data structure is consistance of a squevance of elements ,where each element point to next one.forming a chain.
 linkedlist is three types use first singly linkedlist,doubly linkedlist and circular linkedlist 
 advantange of linkedlist:- dynamic memory allocation , efficient insertion and deletion , can represent complex data structures , can be used to impliment queues and stacks , can be used for memory management and caching , can be used gerbage collections
 
linked list time complexity or singly linked list or ->
insertion-> {
at the begining-o(1)
at the end- o(n) 
at the specificPosition - o(n)
}
deletion->{
at the begining - o(1)
at the end - o(n)
at the specificPosition - o(n)
}
search- o(n),
travesal - o(n)

stack -> stack is linear data Structure thats follows lifo method,commanly use opreation push,pop,peek and this opration time complexity o(1)

Stacks are used in various applications, such as function calls, recursion, expression evaluation, and parsing.

Queue -> A queue is a linear data structure that follows the First-In-First-Out (FIFO) principle, where elements are added at the rear (enqueue) and removed from the front (dequeue).

types of Queues-> 
1.Simple Queue
2.Circular Queue
3.Priority Queue
4.Double-Ended Queue (Deque) 

Time complexity of Queue-> Enqueue: O(1)           
 Dequeue: O(1) for simple and circular queues, O(n) for priority queues


 Heap -> A heap is a complete binary tree that satisfies the heap property: each node’s value is greater than or equal to its children’s values.  

 time complexity of inserting and deletion an element into a heap -> O(log n), where n is the number of elements in the heap.

 time complexity of finding the minimum or maximum element in a heap-> O(1), as the root node always contains the minimum or maximum element.

The event loop is a core concept in JavaScript, particularly in how asynchronous operations are handled. JavaScript is single-threaded, meaning it can execute only one task at a time. However, with the event loop, it can manage asynchronous tasks like I/O operations, timers, and callbacks without blocking the main thread. call stack and callback queue.
 
package.json->  This file lists the metadata for your project, including the project name, version, description, and dependencies.

while package-lock.json This file locks the exact versions of every installed package, including their sub-dependencies. 

In summary, package.json is a high-level overview of the project and its dependencies, while package-lock.json locks down the exact versions of those dependencies for reproducibility and consistency.

*/
// export const updateProduct = async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     const Productfind = await StartProduction.findById(id);
//     if (!Productfind) {
//       return res
//         .status(404)
//         .json({ message: "Product Not Found", status: false });
//     }

//     const { product_details } = req.body;

//     const processRowProductUpdate = async (item, productType, typeUnits) => {
//       if (item[productType] !== null && item[productType]) {
//         const Rowproduct = await RowProduct.findById(item[productType]);
//         if (Rowproduct) {
//           await Promise.all(
//             item[typeUnits].map(async (data) => {
//               if (data.unit === Rowproduct.stockUnit) {
//                 const existingProduct = Productfind.product_details.find(
//                   (existingItem) =>
//                     existingItem[productType] === item[productType]
//                 );

//                 if (existingProduct) {
//                   const existingUnit = existingProduct[typeUnits].find(
//                     (existingData) => existingData.unit === data.unit
//                   );

//                   if (existingUnit) {
//                     let qty;
//                     const qtyDifference = data.value - existingUnit.value;

//                     if (qtyDifference !== 0) {
//                       qty = Math.abs(qtyDifference);
//                       Rowproduct.qty +=
//                         (productType === "rProduct_name" ? -1 : 1) *
//                         qtyDifference;

//                       if (qtyDifference > 0) {
//                         if (productType === "rProduct_name") {
//                           await productionlapseWarehouse(
//                             qty,
//                             Rowproduct.warehouse,
//                             item[productType]
//                           );
//                         } else {
//                           await productionAddWarehouse(
//                             qty,
//                             Rowproduct.warehouse,
//                             item[productType]
//                           );
//                         }
//                       } else {
//                         if (productType === "rProduct_name") {
//                           await productionAddWarehouse(
//                             qty,
//                             Rowproduct.warehouse,
//                             item[productType]
//                           );
//                         } else {
//                           await productionlapseWarehouse(
//                             qty,
//                             Rowproduct.warehouse,
//                             item[productType]
//                           );
//                         }
//                       }
//                       await Rowproduct.save();
//                     }
//                   }
//                 }
//               }
//             })
//           );
//         }
//       }
//     };

//     const updateProductDetails = async () => {
//       await Promise.all(
//         product_details.map(async (item) => {
//           await processRowProductUpdate(
//             item,
//             "rProduct_name",
//             "rProduct_name_Units"
//           );
//           await processRowProductUpdate(
//             item,
//             "fProduct_name",
//             "fProduct_name_Units"
//           );
//           await processRowProductUpdate(
//             item,
//             "wProduct_name",
//             "wProduct_name_Units"
//           );
//         })
//       );
//     };

//     await updateProductDetails();

//     const updateData = { product_details };
//     await StartProduction.findByIdAndUpdate(id, updateData, { new: true });

//     res
//       .status(200)
//       .json({ message: "Data Updated Successfully", status: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error", status: false });
//   }
// };
