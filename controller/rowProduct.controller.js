import { RowProduct } from "../model/rowProduct.model.js";

export const addProduct = async (req, res) => {
  try {
    let groupDiscount = 0;
    if (req.body.id) {
      const existing = await RowProduct.findOne({
        status: "Active",
        database: req.body.database,
        id: req.body.id,
      });
      if (existing) {
        return res
          .status(404)
          .json({ message: "id already exist", status: false });
      }
    } else {
      return res
        .status(400)
        .json({ message: "product id required", status: false });
    }
    const group = await CustomerGroup.find({
      database: req.body.database,
      status: "Active",
    });
    if (group.length > 0) {
      const maxDiscount = group.reduce((max, group) => {
        return group.discount > max.discount ? group : max;
      });
      groupDiscount = maxDiscount.discount;
    }
    // if (req.files) {
    //   let images = [];
    //   req.files.map((file) => {
    //     images.push(file.filename);
    //   });
    //   req.body.Product_image = images;
    // }
    // if (!req.body.ProfitPercentage || req.body.ProfitPercentage === 0) {
    //   req.body.SalesRate = req.body.Purchase_Rate * 1.03;
    //   req.body.Product_MRP =
    //     req.body.SalesRate *
    //     (1 + req.body.GSTRate / 100) *
    //     (1 + groupDiscount / 100);

    //   // const latest = (req.body.SalesRate + (req.body.SalesRate * req.body.GSTRate / 100))
    //   // req.body.Product_MRP = latest + (latest * (groupDiscount) / 100);
    // }
    if (req.body.Opening_Stock) {
      req.body.qty = req.body.Opening_Stock;
    }
    const product = await RowProduct.create(req.body);
    await addProductInWarehouse1(req.body, product.warehouse, product);
    return product
      ? res
          .status(200)
          .json({ message: "product save successfully", status: true })
      : res
          .status(400)
          .json({ message: "something went wrong", status: false });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
};
