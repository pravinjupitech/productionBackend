import { RowProduct } from "../model/rowProduct.model.js";
import { StartProduction } from "../model/startProduction.model.js";
import { Warehouse } from "../model/warehouse.model.js";

export const createProduction = async (req, res, next) => {
  try {
    const { product_details } = req.body;
    for (const item of product_details) {
      if (item?.rProduct_name) {
        await updateProductQty(
          item?.rProduct_name,
          item?.rProduct_name_Units,
          "deduct",
          res
        );
      }

      if (item?.fProduct_name) {
        await updateProductQty(
          item?.fProduct_name,
          item?.fProduct_name_Units,
          "add",
          res
        );
      }

      if (item?.wProduct_name) {
        await updateProductQty(
          item?.wProduct_name,
          item?.wProduct_name_Units,
          "add",
          res
        );
      }
    }
    const product = await StartProduction.create(req.body);
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
const updateProductQty = async (productId, productUnits, actionType, res) => {
  const product = await RowProduct.findById(productId);
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
    const product = await StartProduction.find({
      database: req.params.database,
    })
      .sort({ sortorder: -1 })
      .populate({ path: "product_details.user_name", model: "user" })
      .populate({ path: "product_details.fProduct_name", model: "rowProduct" })
      .populate({ path: "product_details.rProduct_name", model: "rowProduct" })
      .populate({ path: "product_details.wProduct_name", model: "rowProduct" })
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
    const product = await StartProduction.findById(req.params.id).populate({
      path: "product_details.user_name",
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

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const FindProduct = await StartProduction.findById(id);
    if (!FindProduct) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    for (const item of FindProduct.product_details) {
      await handleProductRevert(item);
    }
    await StartProduction.findByIdAndDelete(id);
    res.status(200).json({ message: "Data Deleted", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

const handleProductRevert = async (item) => {
  if (item.rProduct_name && item.rProduct_name_Units.length > 0) {
    const Rowproduct = await RowProduct.findById(item.rProduct_name);
    await revertStockUnits(item?.rProduct_name_Units, Rowproduct, "add");
  }

  if (item.fProduct_name && item.fProduct_name_Units.length > 0) {
    const Rowproduct = await RowProduct.findById(item.fProduct_name);
    await revertStockUnits(item?.fProduct_name_Units, Rowproduct, "deduct");
  }

  if (item?.wProduct_name && item?.wProduct_name_Units.length > 0) {
    const Rowproduct = await RowProduct.findById(item.wProduct_name);
    await revertStockUnits(item?.wProduct_name_Units, Rowproduct, "deduct");
  }
};

const revertStockUnits = async (units, product, actionType) => {
  if (units.length > 0) {
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

export const updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const Productfind = await StartProduction.findById(id);

    if (!Productfind) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    const { product_details } = req.body;
    const processRowProductUpdate = async (
      item,
      productType,
      typeUnits,
      Action,
      qty
    ) => {
      if (item[productType]) {
        const Rowproduct = await RowProduct.findById(item[productType]);
        if (Rowproduct) {
          await Promise.all(
            item[typeUnits].map(async (data) => {
              if (data.unit === Rowproduct.stockUnit) {
                Rowproduct.qty += Action === "Lapse" ? -qty : qty;
                const warehouseFunc =
                  Action === "Add"
                    ? productionAddWarehouse
                    : productionlapseWarehouse;
                await warehouseFunc(
                  Math.abs(qty),
                  Rowproduct.warehouse,
                  item[productType]
                );
                await Rowproduct.save();
              }
            })
          );
        }
      }
    };
    const updateProductDetails = async () => {
      const existingProductDetails = Productfind.product_details;
      if (product_details.length > existingProductDetails.length) {
        console.log("Current product list is greater than existing products.");
        for (let i = 0; i < product_details.length; i++) {
          const item = product_details[i];
          const existingItem = existingProductDetails[i];
          if (!existingItem) {
            if (item.rProduct_name) {
              const RowRProduct = await RowProduct.findById(item.rProduct_name);
              const rProductQtyTotal = item.rProduct_name_Units
                ? item.rProduct_name_Units.reduce((total, unit) => {
                    return unit.unit === RowRProduct.stockUnit
                      ? total + unit.value
                      : total;
                  }, 0)
                : 0;
              await processRowProductUpdate(
                item,
                "rProduct_name",
                "rProduct_name_Units",
                "Lapse",
                rProductQtyTotal
              );
            }

            if (item.fProduct_name) {
              const RowFProduct = await RowProduct.findById(item.fProduct_name);
              const fProductQtyTotal = item.fProduct_name_Units
                ? item.fProduct_name_Units.reduce((total, unit) => {
                    return unit.unit === RowFProduct.stockUnit
                      ? total + unit.value
                      : total;
                  }, 0)
                : 0;
              await processRowProductUpdate(
                item,
                "fProduct_name",
                "fProduct_name_Units",
                "Add",
                fProductQtyTotal
              );
            }
            if (item.wProduct_name) {
              const RowWProduct = await RowProduct.findById(item.wProduct_name);
              const wProductQtyTotal = item.wProduct_name_Units
                ? item.wProduct_name_Units.reduce((total, unit) => {
                    return unit.unit === RowWProduct.stockUnit
                      ? total + unit.value
                      : total;
                  }, 0)
                : 0;
              await processRowProductUpdate(
                item,
                "wProduct_name",
                "wProduct_name_Units",
                "Add",
                wProductQtyTotal
              );
            }
            continue;
          }

          const processProductType = async (productType, unitType, action) => {
            if (item[productType] && existingItem[productType]) {
              const Rowproduct = await RowProduct.findById(item[productType]);

              const existingQty = existingItem[unitType]
                ? existingItem[unitType].reduce((total, unit) => {
                    return unit.unit === Rowproduct.stockUnit
                      ? total + unit.value
                      : total;
                  }, 0)
                : 0;
              console.log("[productType]", [productType]);
              console.log("existingQty", existingQty);
              const currentQty = item[unitType]
                ? item[unitType].reduce((total, unit) => {
                    return unit.unit === Rowproduct.stockUnit
                      ? total + unit.value
                      : total;
                  }, 0)
                : 0;
              console.log("currentQty", currentQty);

              const qtyDifference = Math.abs(existingQty - currentQty);

              if (existingQty > currentQty) {
                if (productType === "rProduct_name") {
                  console.log(
                    `Existing ${productType} quantity is greater; Adding difference:`,
                    qtyDifference
                  );
                  await processRowProductUpdate(
                    item,
                    productType,
                    unitType,
                    "Add",
                    qtyDifference
                  );
                } else {
                  console.log(
                    `Existing ${productType} quantity is greater; Lapse difference:`,
                    qtyDifference
                  );
                  await processRowProductUpdate(
                    item,
                    productType,
                    unitType,
                    "Lapse",
                    qtyDifference
                  );
                }
              } else {
                if (productType === "rProduct_name") {
                  console.log(
                    `Current ${productType} quantity is greater or equal; Lapsing difference:`,
                    qtyDifference
                  );
                  await processRowProductUpdate(
                    item,
                    productType,
                    unitType,
                    "Lapse",
                    qtyDifference
                  );
                } else {
                  console.log(
                    `Current ${productType} quantity is greater or equal; Adding difference:`,
                    qtyDifference
                  );
                  await processRowProductUpdate(
                    item,
                    productType,
                    unitType,
                    "Add",
                    qtyDifference
                  );
                }
              }
            } else {
              console.log(
                `Product ${productType} does not match. Lapsing current quantity:`,
                item[unitType]
              );
              const currentQtyTotal = item[unitType]
                ? item[unitType].reduce((total, unit) => total + unit.value, 0)
                : 0;
              console.log("currentQty", currentQtyTotal);
              await processRowProductUpdate(
                item,
                productType,
                unitType,
                "Lapse",
                currentQtyTotal
              );
            }
          };
          await processProductType(
            "rProduct_name",
            "rProduct_name_Units",
            "Lapse"
          );
          await processProductType(
            "fProduct_name",
            "fProduct_name_Units",
            "Add"
          );
          await processProductType(
            "wProduct_name",
            "wProduct_name_Units",
            "Add"
          );
        }
      } else if (product_details.length < existingProductDetails.length) {
        console.log("Calling existing product greater than current product");
        for (let i = 0; i < existingProductDetails.length; i++) {
          const item = existingProductDetails[i];
          const currentItem = product_details[i];
          if (!currentItem) {
            if (item.rProduct_name) {
              const RowRProduct = await RowProduct.findById(item.rProduct_name);
              const rProductQtyTotal = item.rProduct_name_Units
                ? item.rProduct_name_Units.reduce((total, unit) => {
                    return unit.unit === RowRProduct.stockUnit
                      ? total + unit.value
                      : total;
                  }, 0)
                : 0;
              await processRowProductUpdate(
                item,
                "rProduct_name",
                "rProduct_name_Units",
                "Add",
                rProductQtyTotal
              );
            }

            if (item.fProduct_name) {
              const RowFProduct = await RowProduct.findById(item.fProduct_name);
              const fProductQtyTotal = item.fProduct_name_Units
                ? item.fProduct_name_Units.reduce((total, unit) => {
                    return unit.unit === RowFProduct.stockUnit
                      ? total + unit.value
                      : total;
                  }, 0)
                : 0;
              await processRowProductUpdate(
                item,
                "fProduct_name",
                "fProduct_name_Units",
                "Lapse",
                fProductQtyTotal
              );
            }

            if (item.wProduct_name) {
              const RowWProduct = await RowProduct.findById(item.wProduct_name);
              const wProductQtyTotal = item.wProduct_name_Units
                ? item.wProduct_name_Units.reduce((total, unit) => {
                    return unit.unit === RowWProduct.stockUnit
                      ? total + unit.value
                      : total;
                  }, 0)
                : 0;
              await processRowProductUpdate(
                item,
                "wProduct_name",
                "wProduct_name_Units",
                "Lapse",
                wProductQtyTotal
              );
            }

            continue;
          }
          const processProductType = async (productType, unitType, action) => {
            if (item[productType] && currentItem[productType]) {
              const Rowproduct = await RowProduct.findById(item[productType]);

              const existingQty = currentItem[unitType]
                ? currentItem[unitType].reduce((total, unit) => {
                    return unit.unit === Rowproduct.stockUnit
                      ? total + unit.value
                      : total;
                  }, 0)
                : 0;
              console.log("[productType]", [productType]);
              console.log("existingQty", existingQty);
              const currentQty = item[unitType]
                ? item[unitType].reduce((total, unit) => {
                    return unit.unit === Rowproduct.stockUnit
                      ? total + unit.value
                      : total;
                  }, 0)
                : 0;
              console.log("currentQty", currentQty);

              const qtyDifference = Math.abs(existingQty - currentQty);

              if (existingQty > currentQty) {
                if (productType === "rProduct_name") {
                  console.log(
                    `Existing ${productType} quantity is greater; Adding difference:`,
                    qtyDifference
                  );
                  await processRowProductUpdate(
                    item,
                    productType,
                    unitType,
                    "Add",
                    qtyDifference
                  );
                } else {
                  console.log(
                    `Existing ${productType} quantity is greater; Lapse difference:`,
                    qtyDifference
                  );
                  await processRowProductUpdate(
                    item,
                    productType,
                    unitType,
                    "Lapse",
                    qtyDifference
                  );
                }
              } else {
                if (productType === "rProduct_name") {
                  console.log(
                    `Current ${productType} quantity is greater or equal; Lapsing difference:`,
                    qtyDifference
                  );
                  await processRowProductUpdate(
                    item,
                    productType,
                    unitType,
                    "Lapse",
                    qtyDifference
                  );
                } else {
                  console.log(
                    `Current ${productType} quantity is greater or equal; Adding difference:`,
                    qtyDifference
                  );
                  await processRowProductUpdate(
                    item,
                    productType,
                    unitType,
                    "Add",
                    qtyDifference
                  );
                }
              }
            } else {
              console.log(
                `Product ${productType} does not match. Lapsing current quantity:`,
                item[unitType]
              );
              const currentQtyTotal = item[unitType]
                ? item[unitType].reduce((total, unit) => total + unit.value, 0)
                : 0;
              console.log("currentQtyTotal", currentQtyTotal);
              await processRowProductUpdate(
                item,
                productType,
                unitType,
                "Lapse",
                currentQtyTotal
              );
            }
          };
          await processProductType(
            "rProduct_name",
            "rProduct_name_Units",
            "Add"
          );
          await processProductType(
            "fProduct_name",
            "fProduct_name_Units",
            "Lapse"
          );
          await processProductType(
            "wProduct_name",
            "wProduct_name_Units",
            "Lapse"
          );
        }
      } else {
        await Promise.all(
          product_details.map(async (item) => {
            if (item.rProduct_name && item.rProduct_name_Units.length > 0) {
              const existingItem = existingProductDetails.find(
                (prod) => prod.rProduct_name === item.rProduct_name
              );
              // console.log("RawProductExitingItem", existingItem);
              if (existingItem) {
                const Rowproduct = await RowProduct.findById(
                  item.rProduct_name
                );
                const existingQty = existingItem.rProduct_name_Units.reduce(
                  (total, unit) =>
                    unit.unit === Rowproduct.stockUnit
                      ? total + unit.value
                      : total,
                  0
                );
                // console.log("RawExitQty", existingQty);
                const currentQty = item.rProduct_name_Units.reduce(
                  (total, unit) =>
                    unit.unit === Rowproduct.stockUnit
                      ? total + unit.value
                      : total,
                  0
                );
                // console.log("RawCurrentQty", currentQty);
                let qtyDifference = Math.abs(existingQty - currentQty);
                if (existingQty > currentQty) {
                  // console.log("Add Raw qty", qtyDifference);
                  await processRowProductUpdate(
                    item,
                    "rProduct_name",
                    "rProduct_name_Units",
                    "Add",
                    qtyDifference
                  );
                } else if (currentQty > existingQty) {
                  // console.log("lapse Raw qty", qtyDifference);
                  await processRowProductUpdate(
                    item,
                    "rProduct_name",
                    "rProduct_name_Units",
                    "Lapse",
                    qtyDifference
                  );
                }
              } else {
                const Rowproduct = await RowProduct.findById(
                  item.rProduct_name
                );
                // console.log("not RawProduct exiting");
                item.fProduct_name_Units.map(async (item1) => {
                  if (Rowproduct.stockUnit == item1.unit) {
                    await processRowProductUpdate(
                      item,
                      "rProduct_name",
                      "rProduct_name_Units",
                      "Lapse",
                      item1.value
                    );
                  }
                });
              }
            }
            if (item.fProduct_name && item.fProduct_name_Units.length > 0) {
              const existingItem = existingProductDetails.find(
                (prod) => prod.fProduct_name === item.fProduct_name
              );
              if (existingItem) {
                const Rowproduct = await RowProduct.findById(
                  item.fProduct_name
                );
                // console.log("Final Exiting", existingItem);
                const existingQty = existingItem.fProduct_name_Units.reduce(
                  (total, unit) =>
                    unit.unit === Rowproduct.stockUnit
                      ? total + unit.value
                      : total,
                  0
                );
                // console.log("final product Exitingqty", existingQty);
                const currentQty = item.fProduct_name_Units.reduce(
                  (total, unit) =>
                    unit.unit === Rowproduct.stockUnit
                      ? total + unit.value
                      : total,
                  0
                );
                // console.log("current final ", currentQty);
                let qtyDifference = Math.abs(existingQty - currentQty);
                if (existingQty > currentQty) {
                  // console.log("lapse final qty", qtyDifference);
                  await processRowProductUpdate(
                    item,
                    "fProduct_name",
                    "fProduct_name_Units",
                    "Lapse",
                    qtyDifference
                  );
                } else if (currentQty > existingQty) {
                  // console.log("add final qty", qtyDifference);
                  await processRowProductUpdate(
                    item,
                    "fProduct_name",
                    "fProduct_name_Units",
                    "Add",
                    qtyDifference
                  );
                }
              } else {
                const Rowproduct = await RowProduct.findById(
                  item.fProduct_name
                );
                // console.log("not  final Product exiting");
                item.fProduct_name_Units.map(async (item1) => {
                  if (Rowproduct.stockUnit == item1.unit) {
                    await processRowProductUpdate(
                      item,
                      "fProduct_name",
                      "fProduct_name_Units",
                      "Add",
                      item1.value
                    );
                  }
                });
              }
            }
            if (item.wProduct_name && item.wProduct_name_Units.length > 0) {
              const existingItem = existingProductDetails.find(
                (prod) => prod.wProduct_name === item.wProduct_name
              );
              if (existingItem) {
                const Rowproduct = await RowProduct.findById(
                  item.wProduct_name
                );
                // console.log("wastage Product exiting", existingItem);
                const existingQty = existingItem.wProduct_name_Units.reduce(
                  (total, unit) =>
                    unit.unit === Rowproduct.stockUnit
                      ? total + unit.value
                      : total,
                  0
                );
                // console.log("wastage existingQty", existingQty);
                const currentQty = item.wProduct_name_Units.reduce(
                  (total, unit) =>
                    unit.unit === Rowproduct.stockUnit
                      ? total + unit.value
                      : total,
                  0
                );
                // console.log("currentQty", currentQty);
                let qtyDifference = Math.abs(existingQty - currentQty);
                if (existingQty > currentQty) {
                  // console.log("lapse wastage qty", qtyDifference);
                  await processRowProductUpdate(
                    item,
                    "wProduct_name",
                    "wProduct_name_Units",
                    "Lapse",
                    qtyDifference
                  );
                } else if (currentQty > existingQty) {
                  // console.log("Add wastage qty", qtyDifference);
                  await processRowProductUpdate(
                    item,
                    "wProduct_name",
                    "wProduct_name_Units",
                    "Add",
                    qtyDifference
                  );
                }
              } else {
                // console.log("not  wastage Product exiting");
                const Rowproduct = await RowProduct.findById(
                  item.wProduct_name
                );
                // console.log("not wastage", Rowproduct);
                item.wProduct_name_Units.map(async (item1) => {
                  if (Rowproduct.stockUnit == item1.unit) {
                    console.log(
                      "Wastaage",
                      Rowproduct.stockUnit,
                      item1.unit,
                      item1.value
                    );
                    await processRowProductUpdate(
                      item,
                      "wProduct_name",
                      "wProduct_name_Units",
                      "Add",
                      item1.value
                    );
                  }
                });
              }
            }
          })
        );
      }
    };
    await updateProductDetails();
    const updateData = { product_details };
    await StartProduction.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Data Updated", status: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
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

/* 
// export const updateProduct = async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     const Productfind = await StartProduction.findById(id);

//     if (!Productfind) {
//       return res.status(404).json({ message: "Not Found", status: false });
//     }

//     const { product_details } = req.body;
//     const processRowProductUpdate = async (
//       item,
//       productType,
//       typeUnits,
//       Action,
//       qty
//     ) => {
//       if (item[productType]) {
//         const Rowproduct = await RowProduct.findById(item[productType]);
//         if (Rowproduct) {
//           await Promise.all(
//             item[typeUnits].map(async (data) => {
//               if (data.unit === Rowproduct.stockUnit) {
//                 Rowproduct.qty += Action === "Lapse" ? -qty : qty;
//                 const warehouseFunc =
//                   Action === "Add"
//                     ? productionAddWarehouse
//                     : productionlapseWarehouse;
//                 await warehouseFunc(
//                   Math.abs(qty),
//                   Rowproduct.warehouse,
//                   item[productType]
//                 );
//                 await Rowproduct.save();
//               }
//             })
//           );
//         }
//       }
//     };

//     const updateProductDetails = async () => {
//       const existingProductDetails = Productfind.product_details;
//       if (product_details.length > existingProductDetails.length) {
//         await Promise.all(
//           product_details.map(async (item) => {
//             const Rowproduct = await RowProduct.findById(item.rProduct_name);
//             const existingQty = existingProductDetails.reduce(
//               (total, unit) =>
//                 unit.unit === Rowproduct.stockUnit ? total + unit.value : total,
//               0
//             );
//             const currentQty = item.rProduct_name_Units.reduce(
//               (total, unit) =>
//                 unit.unit === Rowproduct.stockUnit ? total + unit.value : total,
//               0
//             );
//             const qtyDifference = Math.abs(existingQty - currentQty);

//             await processRowProductUpdate(
//               item,
//               "rProduct_name",
//               "rProduct_name_Units",
//               "Lapse",
//               qtyDifference
//             );
//             await processRowProductUpdate(
//               item,
//               "fProduct_name",
//               "fProduct_name_Units",
//               "Add",
//               qtyDifference
//             );
//             await processRowProductUpdate(
//               item,
//               "wProduct_name",
//               "wProduct_name_Units",
//               "Add",
//               qtyDifference
//             );
//           })
//         );
//       } else if (product_details.length < existingProductDetails.length) {
//         await Promise.all(
//           existingProductDetails.map(async (item) => {
//             const Rowproduct = await RowProduct.findById(item.rProduct_name);
//             const existingQty = existingProductDetails.reduce(
//               (total, unit) =>
//                 unit.unit === Rowproduct.stockUnit ? total + unit.value : total,
//               0
//             );
//             const currentQty = item.rProduct_name_Units.reduce(
//               (total, unit) =>
//                 unit.unit === Rowproduct.stockUnit ? total + unit.value : total,
//               0
//             );
//             const qtyDifference = Math.abs(existingQty - currentQty);
//             await processRowProductUpdate(
//               item,
//               "rProduct_name",
//               "rProduct_name_Units",
//               "Add",
//               qtyDifference
//             );
//             await processRowProductUpdate(
//               item,
//               "fProduct_name",
//               "fProduct_name_Units",
//               "Lapse",
//               qtyDifference
//             );
//             await processRowProductUpdate(
//               item,
//               "wProduct_name",
//               "wProduct_name_Units",
//               "Lapse",
//               qtyDifference
//             );
//           })
//         );
//       } else {
//         await Promise.all(
//           product_details.map(async (item) => {
//             const existingItem = existingProductDetails.find(
//               (prod) => prod.rProduct_name === item.rProduct_name
//             );
//             if (existingItem) {

//               const Rowproduct = await RowProduct.findById(item.rProduct_name);
//               const existingQty = existingItem.rProduct_name_Units.reduce(
//                 (total, unit) =>
//                   unit.unit === Rowproduct.stockUnit
//                     ? total + unit.value
//                     : total,
//                 0
//               );
//               const currentQty = item.rProduct_name_Units.reduce(
//                 (total, unit) =>
//                   unit.unit === Rowproduct.stockUnit
//                     ? total + unit.value
//                     : total,
//                 0
//               );
//               let qtyDifference = Math.abs(existingQty - currentQty);
//               if (existingQty > currentQty) {
//                 await processRowProductUpdate(
//                   item,
//                   "rProduct_name",
//                   "rProduct_name_Units",
//                   "Add",
//                   qtyDifference
//                 );
//                 await processRowProductUpdate(
//                   item,
//                   "fProduct_name",
//                   "fProduct_name_Units",
//                   "Lapse",
//                   qtyDifference
//                 );
//                 await processRowProductUpdate(
//                   item,
//                   "wProduct_name",
//                   "wProduct_name_Units",
//                   "Lapse",
//                   qtyDifference
//                 );
//               } else if (currentQty > existingQty) {
//                 await processRowProductUpdate(
//                   item,
//                   "rProduct_name",
//                   "rProduct_name_Units",
//                   "Lapse",
//                   qtyDifference
//                 );
//                 await processRowProductUpdate(
//                   item,
//                   "fProduct_name",
//                   "fProduct_name_Units",
//                   "Add",
//                   qtyDifference
//                 );
//                 await processRowProductUpdate(
//                   item,
//                   "wProduct_name",
//                   "wProduct_name_Units",
//                   "Add",
//                   qtyDifference
//                 );
//               }
//             }
//           })
//         );
//       }
//     };
//     await updateProductDetails();
//     const updateData = { product_details };
//     await StartProduction.findByIdAndUpdate(id, updateData, { new: true });
//     res.status(200).json({ message: "Data Updated", status: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error", status: false });
//   }
// };

*/
