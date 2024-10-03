import express from "express";
import { addProduct } from "../controller/rowProduct.controller.js";
const router = express.Router();

router.post("/save-product", addProduct);
export default router;
