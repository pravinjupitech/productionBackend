import { Product } from "../model/product.model.js";
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
      .populate({ path: "user_name", model: "user" })
      .populate({ path: "product_details.fProduct_name", model: "rowProduct" })
      .populate({ path: "product_details.rProduct_name", model: "rowProduct" })
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
    res.status(200).json({ message: "Data Deleted", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

const handleProductRevert = async (item) => {
  if (
    item.rProduct_name &&
    Array.isArray(item.rProduct_name_Units) &&
    item.rProduct_name_Units.length > 0
  ) {
    const Rowproduct = await RowProduct.findById(item.rProduct_name);
    await revertStockUnits(item?.rProduct_name_Units, Rowproduct, "add");
  }

  if (
    item.fProduct_name &&
    Array.isArray(item.fProduct_name_Units) &&
    item.fProduct_name_Units.length > 0
  ) {
    const Rowproduct = await RowProduct.findById(item.fProduct_name);
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
                if (Action === "Lapse") {
                  Rowproduct.qty -= qty;
                } else {
                  Rowproduct.qty += qty;
                }

                const warehouseFunc =
                  (Action === "Add" && productType !== "rProduct_name") ||
                  (Action === "Lapse" && productType === "rProduct_name")
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
      if (product_details.length > Productfind.product_details.length) {
        await Promise.all(
          product_details.map(async (item) => {
            await processRowProductUpdate(
              item,
              "rProduct_name",
              "rProduct_name_Units",
              "Lapse"
            );
            await processRowProductUpdate(
              item,
              "fProduct_name",
              "fProduct_name_Units",
              "Add"
            );
            await processRowProductUpdate(
              item,
              "wProduct_name",
              "wProduct_name_Units",
              "Add"
            );
          })
        );
      } else if (product_details.length < Productfind.product_details.length) {
        await Promise.all(
          Productfind.product_details.map(async (item) => {
            await processRowProductUpdate(
              item,
              "rProduct_name",
              "rProduct_name_Units",
              "Add"
            );
            await processRowProductUpdate(
              item,
              "fProduct_name",
              "fProduct_name_Units",
              "Lapse"
            );
            await processRowProductUpdate(
              item,
              "wProduct_name",
              "wProduct_name_Units",
              "Lapse"
            );
          })
        );
      } else {
        await Promise.all(
          product_details.map(async (item) => {
            const existingItem = Productfind.product_details.find(
              (prod) => prod.rProduct_name === item.rProduct_name
            );

            if (existingItem) {
              const existingQty = existingItem.rProduct_name_Units.reduce(
                (total, unit) => total + unit.value,
                0
              );
              const currentQty = item.rProduct_name_Units.reduce(
                (total, unit) => total + unit.value,
                0
              );
              let qtyDifference = 0;

              if (existingQty > currentQty) {
                qtyDifference = existingQty - currentQty;
                await processRowProductUpdate(
                  item,
                  "rProduct_name",
                  "rProduct_name_Units",
                  "Add",
                  qtyDifference
                );
                await processRowProductUpdate(
                  item,
                  "fProduct_name",
                  "fProduct_name_Units",
                  "Lapse",
                  currentQty
                );
                await processRowProductUpdate(
                  item,
                  "wProduct_name",
                  "wProduct_name_Units",
                  "Lapse",
                  currentQty
                );
              } else if (currentQty > existingQty) {
                qtyDifference = currentQty - existingQty;
                await processRowProductUpdate(
                  item,
                  "rProduct_name",
                  "rProduct_name_Units",
                  "Lapse",
                  qtyDifference
                );
                await processRowProductUpdate(
                  item,
                  "fProduct_name",
                  "fProduct_name_Units",
                  "Add",
                  currentQty
                );
                await processRowProductUpdate(
                  item,
                  "wProduct_name",
                  "wProduct_name_Units",
                  "Add",
                  currentQty
                );
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
//       Action
//     ) => {
//       if (item[productType]) {
//         const Rowproduct = await RowProduct.findById(item[productType]);
//         if (Rowproduct) {
//           await Promise.all(
//             item[typeUnits].map(async (data) => {
//               if (data.unit === Rowproduct.stockUnit) {
//                 let qty;
//                 if (Action === "Lapse") {
//                   qty = data.value;
//                   Rowproduct.qty -= qty;
//                 } else if (Action === "Add") {
//                   qty = data.value;
//                   Rowproduct.qty += qty;
//                 }

//                 const warehouseFunc =
//                   (Action === "Add" && productType !== "rProduct_name") ||
//                   (Action === "Lapse" && productType === "rProduct_name")
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
//       if (product_details.length > Productfind.product_details.length) {
//         await Promise.all(
//           product_details.map(async (item) => {
//             await processRowProductUpdate(
//               item,
//               "rProduct_name",
//               "rProduct_name_Units",
//               "Lapse"
//             );
//             await processRowProductUpdate(
//               item,
//               "fProduct_name",
//               "fProduct_name_Units",
//               "Add"
//             );
//             await processRowProductUpdate(
//               item,
//               "wProduct_name",
//               "wProduct_name_Units",
//               "Add"
//             );
//           })
//         );
//       } else if (product_details.length < Productfind.product_details.length) {
//         await Promise.all(
//           Productfind.product_details.map(async (item) => {
//             await processRowProductUpdate(
//               item,
//               "rProduct_name",
//               "rProduct_name_Units",
//               "Add"
//             );
//             await processRowProductUpdate(
//               item,
//               "fProduct_name",
//               "fProduct_name_Units",
//               "Lapse"
//             );
//             await processRowProductUpdate(
//               item,
//               "wProduct_name",
//               "wProduct_name_Units",
//               "Lapse"
//             );
//           })
//         );
//       } else {
//         await Promise.all(
//           product_details.map(async (item) => {
//             await processRowProductUpdate(
//               item,
//               "rProduct_name",
//               "rProduct_name_Units",
//               "Lapse"
//             );
//             await processRowProductUpdate(
//               item,
//               "fProduct_name",
//               "fProduct_name_Units",
//               "Add"
//             );
//             await processRowProductUpdate(
//               item,
//               "wProduct_name",
//               "wProduct_name_Units",
//               "Add"
//             );
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
//       Action
//     ) => {
//       if (item[productType]) {
//         const Rowproduct = await RowProduct.findById(item[productType]);
//         if (Rowproduct) {
//           await Promise.all(
//             item[typeUnits].map(async (data) => {
//               if (data.unit === Rowproduct.stockUnit) {
//                 const qty = data.value * (isAdd ? 1 : -1);
//                 Rowproduct.qty += productType === "rProduct_name" ? -qty : qty;

//                 const warehouseFunc =
//                   (isAdd && productType === "rProduct_name") ||
//                   (!isAdd && productType !== "rProduct_name")
//                     ? productionlapseWarehouse
//                     : productionAddWarehouse;

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
//       if (product_details.length > Productfind.product_details.length) {
//         await Promise.all(
//           product_details.map(async (item) => {
//             await processRowProductUpdate(
//               item,
//               "rProduct_name",
//               "rProduct_name_Units",
//               "Lapse"
//             );
//             await processRowProductUpdate(
//               item,
//               "fProduct_name",
//               "fProduct_name_Units",
//               "Add"
//             );
//             await processRowProductUpdate(
//               item,
//               "wProduct_name",
//               "wProduct_name_Units",
//               "Add"
//             );
//           })
//         );
//       } else if (product_details.length < Productfind.product_details.length) {
//         await Promise.all(
//           Productfind.product_details.map(async (item) => {
//             await processRowProductUpdate(
//               item,
//               "rProduct_name",
//               "rProduct_name_Units",
//               "Add"
//             );
//             await processRowProductUpdate(
//               item,
//               "fProduct_name",
//               "fProduct_name_Units",
//               "Lapse"
//             );
//             await processRowProductUpdate(
//               item,
//               "wProduct_name",
//               "wProduct_name_Units",
//               "Lapse"
//             );
//           })
//         );
//       } else {
//         await Promise.all(
//           product_details.map(async (item) => {
//             await processRowProductUpdate(
//               item,
//               "rProduct_name",
//               "rProduct_name_Units"
//             );
//             await processRowProductUpdate(
//               item,
//               "fProduct_name",
//               "fProduct_name_Units"
//             );
//             await processRowProductUpdate(
//               item,
//               "wProduct_name",
//               "wProduct_name_Units"
//             );
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
