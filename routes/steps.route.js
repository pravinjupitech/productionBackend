import express from "express";
import {
  createSteps,
  deleteSteps,
  updateSteps,
  viewSteps,
  viewbyIdSteps,
} from "../controller/steps.controller.js";
const router = express.Router();

router.post("/add-step", createSteps);
router.get("/view-steps/:createdBy", viewSteps);
router.get("/view-steps/:id", viewbyIdSteps);
router.put("/edit-steps/:id", updateSteps);
router.delete("/delete-steps/:id", deleteSteps);
export default router;
