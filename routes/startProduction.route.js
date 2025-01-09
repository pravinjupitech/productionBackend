import express from "express";
import {
  NestedUpdateProduct,
  createProduction,
  deleteNestedProduct,
  deleteProduct,
  productTarget,
  updateProduct,
  viewByIdProduct,
  viewProduct,
} from "../controller/startProduction.controller.js";
const router = express.Router();

router.post("/start-production", createProduction);
router.get("/view-ProductionList/:database", viewProduct);
router.get("/view-by-StartProduction/:id", viewByIdProduct);
router.put("/update-StartProduction/:id", updateProduct);
router.delete("/delete-StartProduction/:id", deleteProduct);
router.delete("/delete-nested-data/:id/:innerId", deleteNestedProduct);
router.put("/nested-update-production/:id/:innerId", NestedUpdateProduct);
router.get("/current-target-product/:id", productTarget);
export default router;
