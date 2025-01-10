import express from "express";
import {
  saveTarget,
  updateTarget,
  viewAllTarget,
  viewByIdTarget,
} from "../controller/rawProductTarget.controller.js";
const router = express.Router();

router.post("/save", saveTarget);
router.get("/view/:database", viewAllTarget);
router.get("/view-by-id/:id", viewByIdTarget);
router.put("/update-target/:id/:innerId", updateTarget);
router.put("/delete-target/:id/:innerId", updateTarget);
export default router;
