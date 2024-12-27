import express from "express";
import path from "path";
import {
  DeleteCategory,
  UpdateCategory,
  ViewCategory,
  ViewCategoryById,
  deleteSubCategory,
  saveCategory,
  saveSubCategory,
  updateSubCategory,
} from "../controller/category.controller.js";
import multer from "multer";

const router = express.Router();

// const upload = multer({ dest: "public/Images/" });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Images/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});
const upload = multer({ storage: storage });

// router.post("/save-category", upload.single("file"), saveCategory);
// router.post(
//   "/save-category",
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "subcategories[0].image", maxCount: 10 },
//   ]),
//   saveCategory
// );
router.post(
  "/save-category",
  (req, res, next) => {
    // Check if subcategories are present and dynamically create the fields
    if (req.body.subcategories) {
      const subcategories = JSON.parse(req.body.subcategories);

      // Create dynamic fields for each subcategory image
      const subcategoryFields = subcategories.map((_, index) => ({
        name: `subcategories[${index}].image`,
        maxCount: 1,
      }));

      // Apply dynamic multer fields (main image + dynamic subcategory images)
      upload.fields([{ name: "image", maxCount: 1 }, ...subcategoryFields])(
        req,
        res,
        next
      );
    } else {
      // If no subcategories, just handle the main image
      upload.fields([{ name: "image", maxCount: 1 }])(req, res, next);
    }
  },
  saveCategory
);

router.get("/view-category/:id/:database", ViewCategory);
router.get("/view-category-by-id/:id", ViewCategoryById);
router.get("/delete-category/:id", DeleteCategory);
router.put("/update-category/:id", upload.single("file"), UpdateCategory);
router.post("/save-subcategory", upload.single("file"), saveSubCategory);
router.put(
  "/update-categories/:categoryId/subcategories/:subcategoryId",
  upload.single("file"),
  updateSubCategory
);
router.delete(
  "/delete-categories/:categoryId/subcategories/:subcategoryId",
  deleteSubCategory
);

export default router;
