import { AssignProduction } from "../model/assignProduction.model.js";
import { Product } from "../model/product.model.js";
import { RowProduct } from "../model/rowProduct.model.js";
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

    const isFirstStep = productsteps.steps[0]._id.toString() === currentStep;

    for (const item of product_details) {
      if (item.rProduct_name !== null) {
        if (isFirstStep) {
          await updateProductQty(
            item.rProduct_name,
            item.rProduct_name_Units,
            "deduct",
            "Product",
            res
          );
        } else {
          await updateProductQty(
            item.rProduct_name,
            item.rProduct_name_Units,
            "deduct",
            "RowProduct",
            res
          );
        }
      }

      if (item.fProduct_name !== null) {
        await updateProductQty(
          item.fProduct_name,
          item.fProduct_name_Units,
          "add",
          "RowProduct",
          res
        );
      }

      if (item.wProduct_name !== null) {
        await updateProductQty(
          item.wProduct_name,
          item.wProduct_name_Units,
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
  const product = await ProductModel.findById(productId);

  if (!product) {
    return res
      .status(404)
      .json({ message: `${modelType} not found`, status: false });
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
      if (item.rProduct_name !== null) {
        product_details.forEach(async (item) => {
          if (item.rProduct_name) {
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
      if (item.fProduct_name !== null) {
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
      if (item.wProduct_name !== null) {
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
        if (item.rProduct_name !== null) {
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
        if (item.fProduct_name !== null) {
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
        if (item.wProduct_name !== null) {
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
                      console.log(exitingData.unit);
                      console.log(exitingData.value, data.value);
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
                      console.log(exitingData.unit);
                      console.log(exitingData.value, data.value);
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
        if (item.rProduct_name !== null) {
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
        if (item.fProduct_name !== null) {
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
        if (item.wProduct_name !== null) {
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
        if (item.rProduct_name !== null) {
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
        if (item.fProduct_name !== null) {
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
        if (item.wProduct_name !== null) {
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

    for (const item of Productfind.product_details) {
      await handleProductRevert(item, isFirstStep);
    }

    await AssignProduction.findByIdAndDelete(id);
    res.status(200).json({ message: "Product Deleted ", status: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

const handleProductRevert = async (item, isFirstStep) => {
  const modelType = isFirstStep ? Product : RowProduct;

  if (item.rProduct_name !== null) {
    const Rowproduct = await modelType.findById(item.rProduct_name);
    await revertStockUnits(item.rProduct_name_Units, Rowproduct, "add");
  }

  if (item.fProduct_name !== null) {
    const Rowproduct = await RowProduct.findById(item.fProduct_name);
    await revertStockUnits(item.fProduct_name_Units, Rowproduct, "deduct");
  }

  if (item.wProduct_name !== null) {
    const Rowproduct = await RowProduct.findById(item.wProduct_name);
    await revertStockUnits(item.wProduct_name_Units, Rowproduct, "deduct");
  }
};

const revertStockUnits = async (units, product, actionType) => {
  if (!product) return;

  for (const unit of units) {
    if (unit.unit === product.stockUnit) {
      product.qty =
        actionType === "add"
          ? product.qty + unit.value
          : product.qty - unit.value;
      await product.save();
      await (actionType === "add"
        ? productionAddWarehouse(unit.value, product.warehouse, product._id)
        : productionlapseWarehouse(unit.value, product.warehouse, product._id));
    }
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
