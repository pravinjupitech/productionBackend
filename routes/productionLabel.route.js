import express from "express";
import {
  UpdateLabel,
  addLabel,
  deleteLabel,
  viewByIdLabel,
  viewLabel,
} from "../controller/productionLabel.controller.js";

const router = express.Router();
router.post("/addLabel", addLabel);
router.get("/viewLabel", viewLabel);
router.get("/viewByIdLabel/:id", viewByIdLabel);
router.put("/updateLabel/:id", UpdateLabel);
router.delete("/deleteLabel/:id", deleteLabel);

export default router;
