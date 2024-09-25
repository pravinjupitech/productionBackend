import express from "express";
import {
  assignProduct,
  viewProduct,
} from "../controller/assignProduction.controller.js";
const router = express.Router();

router.post("/product-assign", assignProduct);
router.get("/view-product", viewProduct);
export default router;
