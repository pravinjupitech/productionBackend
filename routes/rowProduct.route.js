import express from "express";
import {
  DeleteProduct,
  UpdateProduct,
  ViewProduct,
  ViewProductById,
  addProduct,
  viewCurrentStock,
} from "../controller/rowProduct.controller.js";
const router = express.Router();

router.post("/save-product", addProduct);
router.get("/view-product/:database", ViewProduct);
router.get("/view-product-by-id/:id", ViewProductById);
router.delete("/delete-product/:id", DeleteProduct);
router.put("/update-product/:id", UpdateProduct);
router.get("/view-current-stock/:id/:productId", viewCurrentStock);
export default router;
