import express from "express";
import {
  addProduct,
  deleteProduct,
  updateProduct,
  viewByIdProduct,
  viewProduct,
} from "../controller/adminProduction.controller.js";

const router = express.Router();

router.post("/add-product", addProduct);
router.get("/view-product", viewProduct);
router.get("/view-by-id-product/:id", viewByIdProduct);
router.put("/update-product/:id", updateProduct);
router.delete("/delete-product/:id", deleteProduct);
export default router;
