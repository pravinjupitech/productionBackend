import express from "express";
import {
  addShapping,
  deleteShapping,
  updateShapping,
  viewByIdShapping,
  viewShapping,
} from "../controller/shapping.controller.js";
const router = express.Router();

router.post("/addShapping", addShapping);
router.get("/viewShapping", viewShapping);
router.get("/viewByIdShapping/:id", viewByIdShapping);
router.put("/updateShapping/:id", updateShapping);
router.delete("/deleteShapping/:id", deleteShapping);
export default router;
