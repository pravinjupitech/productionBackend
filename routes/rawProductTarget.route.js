import express from "express";
import { saveTarget } from "../controller/rawProductTarget.controller.js";
const router = express.Router();

router.post("/save", saveTarget);
export default router;
