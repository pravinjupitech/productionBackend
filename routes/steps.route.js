import express from "express";
import {
  createSteps,
  deleteSteps,
  innerDelete,
  innerUpdate,
  updateSteps,
  viewSteps,
  viewbyIdSteps,
} from "../controller/steps.controller.js";
const router = express.Router();

router.post("/add-step", createSteps);
router.get("/view-steps/:createdBy", viewSteps);
router.get("/view-by-steps/:id", viewbyIdSteps);
router.put("/edit-steps/:id", updateSteps);
router.delete("/delete-steps/:id", deleteSteps);
router.put("/edit-inner-step/:id/:innerId", innerUpdate);
router.delete("/delete-inner-step/:id/:innerId", innerDelete);
export default router;
