import express from "express";
import {
  CreateOrder,
  deleteOrder,
  updateOrder,
  viewByIdOrder,
  viewOrder,
} from "../controller/productionCreatePurchaseOrder.controller.js";
const router = express.Router();

router.post("/add-order", CreateOrder);
router.get("/viewAll-order", viewOrder);
router.get("/view-by-id-order/:id", viewByIdOrder);
router.put("/update-order/:id", updateOrder);
router.delete("/delete-order/:id", deleteOrder);
export default router;