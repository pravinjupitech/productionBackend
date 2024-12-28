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
//     { name: "subcategories[0].image", maxCount: 1 },
//   ]),
//   saveCategory
// );
// router.post(
//   "/save-category",
//   (req, res, next) => {
//     if (req.body.subcategories) {
//       const subcategories = JSON.parse(req.body.subcategories);
//       const subcategoryFields = [];
//       subcategories.forEach((_, index) => {
//         subcategoryFields.push({
//           name: `images.${index}.image`,
//         });
//       });
//       upload.fields([{ name: "image", maxCount: 1 }, ...subcategoryFields])(
//         req,
//         res,
//         next
//       );
//     } else {
//       upload.fields([{ name: "image", maxCount: 1 }])(req, res, next);
//     }
//   },
//   saveCategory
// );

router.post(
  "/save-category",
  upload.any(),
  (req, res, next) => {
    try {
      if (req.body.subcategories) {
        req.body.subcategories = JSON.parse(req.body.subcategories);
      }

      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          if (file.fieldname === "image") {
            req.body.image = file.filename;
          }
          console.log("file", file);
          const match = file.fieldname.match(/images\[(\d+)\]\.image/);
          if (match) {
            console.log("match call");
            const subcategoryIndex = parseInt(match[1], 10);
            if (
              req.body.subcategories &&
              req.body.subcategories[subcategoryIndex]
            ) {
              req.body.subcategories[subcategoryIndex].image = file.filename;
            }
            console.log("subcategories", req.body.subcategories);
          }
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error processing files", status: false });
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
