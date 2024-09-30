import express from "express";
import {
  assignProduct,
  deleteProduct,
  updateProduct,
  viewByIdProduct,
  viewByIdProduct2,
  viewProduct,
} from "../controller/assignProduction.controller.js";
const router = express.Router();

router.post("/product-assign", assignProduct);
router.get("/view-product/:database", viewProduct);
router.get("/view-by-id/:id", viewByIdProduct);
router.put("/update-product/:id", updateProduct);
router.delete("/delete-product/:id", deleteProduct);
router.get("/view-id-product/:id", viewByIdProduct2);
export default router;
