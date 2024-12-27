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
    // if (req.body.subcategories) {
    // const subcategories = JSON.parse(req.body.subcategories);
    // const subcategoryFields = [];
    // console.log(req.files);
    // const files = req.files.filter(
    //   (file, index) => file.fieldname === `files[${index}]`
    // );
    // console.log(files);
    req.files.forEach((file, index) => {
      if (file.fieldname === "files[0]") {
        // Assign the main category image
        req.body.image = file.originalname;
      } else if (file.fieldname === `files[${index}]`) {
        // Match subcategory index using regex
        const match = file.fieldname.match(/files\[(\d+)\]/);
        console.log("calling1");
        if (match) {
          const subcategoryIndex = parseInt(match[1], 10); // Adjust index if `files[0]` is for the main image

          if (req.body.subcategories[subcategoryIndex]) {
            console.log("calliing 2");
            req.body.subcategories[subcategoryIndex]["image"] =
              file.originalname;
            console.log("dffffffffffffffffffffffff", req.body.subcategories);
          }
        }
      }
    });
    console.log(req.body);
    // files.forEach((file) => {
    //   console.log("Uploaded file: ", file);
    //   console.log("File path: ", file.path);
    //   console.log("File type: ", file.mimetype);
    // });
    // } else {
    //   upload.fields([{ name: "image", maxCount: 1 }])(req, res, next);
    // }
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
