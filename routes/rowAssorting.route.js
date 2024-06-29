import express from "express";
import {
  RowAssortingAdd,
  RowAssortingViewAll,
  innerQtyDelete,
  rowAssortingDelete,
  rowAssortingEdit,
  rowAssortingViewById,
} from "../controller/rowAssorting.controller.js";
const router = express.Router();

router.post("/rowAssortingAdd", RowAssortingAdd);
router.get("/rowAssortingViewAll", RowAssortingViewAll);
router.get("/rowAssortingViewById/:id", rowAssortingViewById);
router.put("/rowAssortingUpdate/:id", rowAssortingEdit);
router.delete("/rowAssortingDelete/:id", rowAssortingDelete);
router.delete("/row-innerQtyDelete/:id/:innerQty", innerQtyDelete);

export default router;
