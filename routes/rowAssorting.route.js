import express from "express";
import {
  RowAssortingAdd,
  RowAssortingViewAll,
  rowAssortingByIdDelete,
  rowAssortingDelete,
  rowAssortingEdit,
  rowAssortingViewById,
} from "../controller/rowAssorting.controller.js";
const router = express.Router();

router.post("/rowAssortingAdd", RowAssortingAdd);
router.get("/rowAssortingViewAll/:database", RowAssortingViewAll);
router.get("/rowAssortingViewById/:id", rowAssortingViewById);
router.put("/rowAssortingUpdate/:id", rowAssortingEdit);
router.delete("/rowAssortingDelete/:id", rowAssortingDelete);
router.delete(
  "/innerAssorting-Delete/:id/:assortingId",
  rowAssortingByIdDelete
);

export default router;
