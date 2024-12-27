import { Category } from "../model/category.model.js";
import { User } from "../model/user.model.js";

// export const saveCategory = async (req, res) => {
//   try {
//     console.log("reqbody", req.body);
//     const user = await User.findById({ _id: req.body.created_by });
//     if (!user) {
//       return res.status(400).json({ message: "User Not Found", status: false });
//     }
//     req.body.database = user.database;
//     if (req.file) {
//       req.body.image = req.file.filename;
//     }

//     // if (req.body.subcategories) {
//     //   req.body.subcategories = JSON.parse(req.body.subcategories);
//     //   req.body.subcategories = req.body.subcategories.map(
//     //     (subcategory, index) => {
//     //       if (req.files && req.files[`subcategories[${index}].image`]) {
//     //         subcategory.image =
//     //           req.files[`subcategories[${index}].image`][0].filename;
//     //       }
//     //       return subcategory;
//     //     }
//     //   );
//     // }
//     if (req.body.subcategories) {
//       const subcategories = JSON.parse(req.body.subcategories);

//       subcategories.forEach((subcategory, index) => {
//         const file = req.files.find(
//           (file) => file.fieldname === `subcategories[${index}].image`
//         );
//         if (file) {
//           subcategory.image = file.filename;
//         }
//       });
//     }

//     const existingCategory = await Category.findOne({
//       name: req.body.name,
//       database: req.body.database,
//       status: "Active",
//     });
//     if (existingCategory) {
//       return res
//         .status(400)
//         .json({ message: "category already existing", status: false });
//     }
//     const category = await Category.create(req.body);
//     return category
//       ? res
//           .status(200)
//           .json({ message: "category save successfully", status: true })
//       : res
//           .status(400)
//           .json({ message: "something went wrong", status: false });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: error, status: false });
//   }
// };

export const saveCategory = async (req, res) => {
  try {
    const { name, description, created_by, subcategories } = req.body;

    const mainImageFile = req.files.find((file) => file.fieldname === "image");
    const mainImage = mainImageFile ? mainImageFile.filename : null;

    const parsedSubcategories = JSON.parse(subcategories || "[]");
    const processedSubcategories = parsedSubcategories.map(
      (subcategory, index) => {
        const subImageFile = req.files.find(
          (file) => file.fieldname === `subcategories[${index}].image`
        );
        return {
          ...subcategory,
          image: subImageFile ? subImageFile.filename : null,
        };
      }
    );

    const category = new Category({
      name,
      description,
      created_by,
      image: mainImage,
      subcategories: processedSubcategories,
    });

    await category.save();

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const ViewCategory = async (req, res, next) => {
  try {
    const userId = req.params.id;
    // const adminDetail = await getCategoryHierarchy(userId);
    // const adminDetail = adminDetails.length === 1 ? adminDetails[0] : adminDetails;
    const database = req.params.database;
    // const adminDetail = await getUserHierarchyBottomToTop(userId, database)
    // if (!adminDetail.length > 0) {
    //     return res.status(404).json({ error: "Category Not Found", status: false })
    // }
    let categories = await Category.find({
      database: database,
      status: "Active",
    }).sort({ sortorder: -1 });
    return categories
      ? res.status(200).json({ Category: categories, status: true })
      : res.status(404).json({ error: "Not Found", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err, status: false });
  }
};
export const ViewCategoryById = async (req, res, next) => {
  try {
    let categories = await Category.findById({ _id: req.params.id }).sort({
      sortorder: -1,
    });
    return categories
      ? res.status(200).json({ Category: categories, status: true })
      : res.status(404).json({ error: "Not Found", status: false });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err, status: false });
  }
};
export const DeleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById({ _id: req.params.id });
    if (!category) {
      return res.status(404).json({ error: "Not Found", status: false });
    }
    category.status = "Deactive";
    await category.save();
    return res.status(200).json({ message: "delete successful", status: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err, status: false });
  }
};
export const UpdateCategory = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = req.file.filename;
    }
    const categoryId = req.params.id;
    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res
        .status(404)
        .json({ error: "category not found", status: false });
    } else {
      const updatedCategory = req.body;
      await Category.findByIdAndUpdate(categoryId, updatedCategory, {
        new: true,
      });
      return res
        .status(200)
        .json({ message: "Category Updated Successfully", status: true });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err, status: false });
  }
};

export const saveSubCategory = async (req, res) => {
  try {
    if (req.file) {
      req.body.image = req.file.filename;
    }
    const category = await Category.findOne({ _id: req.body.category });
    if (category) {
      const newSubCategory = {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        unitType: req.body.unitType,
        status: req.body.status,
      };
      category.subcategories.push(newSubCategory);
      const savedCategory = await category.save();
      return res.status(200).json({
        message: "Subcategory saved successfully",
        status: true,
        category: savedCategory,
      });
    } else {
      return res
        .status(404)
        .json({ message: "Category not found", status: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error, status: false });
  }
};
export const updateSubCategory = async (req, res) => {
  try {
    if (req.file) {
      req.body.image = req.file.filename;
    }
    const { categoryId, subcategoryId } = req.params;
    const { name, image, description, unitType } = req.body;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", status: false });
    }
    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) {
      return res
        .status(404)
        .json({ message: "Subcategory not found", status: false });
    }
    subcategory.name = name || subcategory.name;
    subcategory.image = image || subcategory.image;
    subcategory.description = description || subcategory.description;
    subcategory.unitType = unitType || subcategory.unitType;
    const updatedCategory = await category.save();
    return res.status(200).json({
      message: "Subcategory updated successfully",
      status: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error, status: false });
  }
};
export const deleteSubCategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", status: false });
    }
    category.subcategories = category.subcategories.filter(
      (sub) => sub._id.toString() !== subcategoryId
    );
    const updatedCategory = await category.save();
    return res.status(200).json({
      message: "Subcategory deleted successfully",
      status: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error, status: false });
  }
};
