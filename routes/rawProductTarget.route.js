import express from "express";
import {
  saveTarget,
  viewAll,
} from "../controller/rawProductTarget.controller.js";
const router = express.Router();

router.post("/save", saveTarget);
router.get("/view/:database", viewAll);
export default router;
