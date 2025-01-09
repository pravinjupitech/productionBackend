import express from "express";
import {
  saveTarget,
  viewAllTarget,
  viewByIdTarget,
} from "../controller/rawProductTarget.controller.js";
const router = express.Router();

router.post("/save", saveTarget);
router.get("/view/:database", viewAllTarget);
router.get("/view-by-id/:id", viewByIdTarget);
export default router;
