import express from "express";
import {
  createProduction,
  deleteProduct,
  updateProduct,
  viewByIdProduct,
  viewProduct,
} from "../controller/startProduction.controller.js";
const router = express.Router();

router.post("/start-production", createProduction);
router.get("/view-ProductionList/:database", viewProduct);
// router.get("/view-by-StartProduction/:id", viewByIdProduct);
// router.put("/update-StartProduction/:id", updateProduct);
// router.delete("/delete-StartProduction/:id", deleteProduct);
export default router;
