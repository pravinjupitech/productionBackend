import { RowAssorting } from "../model/rowAssorting.model.js";

export const RowAssortingAdd = async (req, res, next) => {
  try {
    // req.body.assorting = JSON.parse(req.body.assorting);
    const rowAssorting = await RowAssorting.create(req.body);
    return rowAssorting
      ? res.status(200).json({
          message: "Data Saved Successfully",
          rowAssorting,
          status: true,
        })
      : res.status(404).json({ message: "Data Not Save", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const RowAssortingViewAll = async (req, res, next) => {
  try {
    const database = req.params.database;
    const rowAssorting = await RowAssorting.find({ database: database })
      .populate({ path: "assorting.userId", model: "user" })
      .populate({ path: "assorting.productId", model: "product" })
      .exec();
    return rowAssorting
      ? res.status(200).json({
          message: "Data Found Successfully",
          rowAssorting,
          status: true,
        })
      : res
          .status(404)
          .json({ message: "RowAssorting Not Found", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const rowAssortingViewById = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.findById(req.params.id);
    return rowAssorting
      ? res.status(200).json({
          message: "Data Found Successfully",
          rowAssorting,
          status: true,
        })
      : res
          .status(404)
          .json({ message: "RowAssorting Not Found", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const rowAssortingEdit = async (req, res, next) => {
  try {
    // req.body.assorting = JSON.parse(req.body.assorting);
    const updateData = req.body;
    const rowAssorting = await RowAssorting.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    return rowAssorting
      ? res.status(200).json({
          message: "Data Updated Successfully",
          rowAssorting,
          status: true,
        })
      : res.status(404).json({ message: "Data Not Updated", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const rowAssortingByIdUpdate = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.findById(req.params.id);
    if (rowAssorting) {
      const assortingId = req.params.assortingId;
      const assortingIndex = rowAssorting.assorting.findIndex(
        (tot) => tot._id.toString() === assortingId
      );
      if (assortingIndex > -1) {
        const existingAssorting = rowAssorting.assorting[assortingIndex];
        const updatedAssorting = { ...existingAssorting._doc, ...req.body };

        rowAssorting.assorting[assortingIndex] = updatedAssorting;

        await rowAssorting.save();

        res.status(200).json({
          message: "Data Updated Successfully",
          updatedAssorting: rowAssorting.assorting[assortingIndex],
          status: true,
        });
      } else {
        return res.status(404).json({
          message: "Assorting Not Found",
          status: false,
        });
      }
    } else {
      return res.status(404).json({
        message: "RowAssorting Not Found",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const rowAssortingDelete = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.findByIdAndDelete(req.params.id);
    return rowAssorting
      ? res.status(200).json({
          message: "Data Deleted Successfully",
          rowAssorting,
          status: true,
        })
      : res.status(404).json({ message: "Data Not Daleted", status: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const rowAssortingByIdDelete = async (req, res, next) => {
  try {
    const rowAssorting = await RowAssorting.findById(req.params.id);
    if (rowAssorting) {
      const assortingId = req.params.assortingId;
      const assortingIndex = rowAssorting.assorting.findIndex(
        (tot) => tot._id.toString() === assortingId
      );
      if (assortingIndex > -1) {
        rowAssorting.assorting.splice(assortingIndex, 1);
        await rowAssorting.save();
        res.status(200).json({
          message: "Data Deleted Successfully",
          rowAssorting,
          status: true,
        });
      } else {
        return res.status(404).json({
          message: "Assorting Not Found",
          status: false,
        });
      }
    } else {
      return res.status(404).json({
        message: "RowAssorting Not Found",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, status: false });
  }
};

// export const innerQtyDelete = async (req, res, next) => {
//   try {
//     const rowAssorting = await RowAssorting.findById(req.params.id);
//     if (rowAssorting) {
//       const innerQtyId = req.params.innerQtyId;
//       const innerQtyIndex = rowAssorting.innerQty.findIndex(
//         (qty) => qty._id.toString() === innerQtyId
//       );
//       if (innerQtyIndex > -1) {
//         rowAssorting.innerQty.splice(innerQtyIndex, 1);
//         await rowAssorting.save();

//         return res.status(200).json({
//           message: "InnerQty Deleted Successfully",
//           status: true,
//         });
//       } else {
//         return res.status(404).json({
//           message: "InnerQty Not Found",
//           status: false,
//         });
//       }
//     } else {
//       return res.status(404).json({
//         message: "RowAssorting Not Found",
//         status: false,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: error.message, status: false });
//   }
// };
