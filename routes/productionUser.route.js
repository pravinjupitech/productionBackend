import express from "express";
import {
  createUser,
  deleteUser,
  updateUser,
  viewByIdUser,
  viewUser,
} from "../controller/productionUser.controller.js";
const router = express.Router();

router.post("/user-add", createUser);
router.get("/user-view", viewUser);
router.get("/user-viewById/:id", viewByIdUser);
router.put("/user-update/:id", updateUser);
router.delete("/user-delete/:id", deleteUser);
export default router;
