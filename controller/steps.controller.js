import { StepsModel } from "../model/steps.model.js";

export const createSteps = async (req, res, next) => {
  try {
    const { processName, steps } = req.body;
    const findSteps = await StepsModel.findOne({ processName });
    if (findSteps) {
      if (steps.length > 0) {
        steps.forEach((step) => {
          findSteps.steps.push(step);
        });
      } else {
        return res.status(404).json({ message: "Invalid Data", status: false });
      }
      await findSteps.save();
      return res
        .status(200)
        .json({ message: "Steps Added Successfully", status: true });
    } else {
      const stepsDoc = await StepsModel.create(req.body);
      return stepsDoc
        ? res
            .status(200)
            .json({ message: "Data Added Successfully", status: true })
        : res
            .status(404)
            .json({ message: "Something Went Wrong", status: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewSteps = async (req, res, next) => {
  try {
    const id = req.params.createdBy;
    const steps = await StepsModel.find({ createdBy: id })
      .sort({
        sortorder: -1,
      })
      .populate({ path: "processName", model: "category" });
    return steps.length > 0
      ? res.status(200).json({ message: "Data Found", steps, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewbyIdSteps = async (req, res, next) => {
  try {
    const id = req.params.id;
    const steps = await StepsModel.findById(id);
    return steps
      ? res.status(200).json({ message: "Data Found", steps, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const updateSteps = async (req, res, next) => {
  try {
    const id = req.params.id;
    const steps = await StepsModel.findById(id);
    if (!steps) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    const updatedData = req.body;
    await StepsModel.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ message: "Data Updated", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const deleteSteps = async (req, res, next) => {
  try {
    const id = req.params.id;
    const steps = await StepsModel.findById(id);
    if (!steps) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    await StepsModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Data Deleted", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const innerUpdate = async (req, res, next) => {
  try {
    const { id, innerId } = req.params;
    const OuterSteps = await StepsModel.findById(id);
    if (OuterSteps) {
      const findIndex = OuterSteps.steps.findIndex(
        (item) => item._id.toString() === innerId
      );
      if (findIndex !== -1) {
        OuterSteps.steps[findIndex] = {
          ...OuterSteps.steps[findIndex]._doc,
          ...req.body,
        };
        await OuterSteps.save();
        return res
          .status(200)
          .json({ message: "Data Updated Successfully", status: true });
      } else {
        return res
          .status(404)
          .json({ error: "Inner Data Not Found", status: false });
      }
    } else {
      return res.status(404).json({ error: "Not Found", status: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const innerDelete = async (req, res, next) => {
  try {
    const { id, innerId } = req.params;
    const OuterSteps = await StepsModel.findById(id);

    if (OuterSteps) {
      const findIndex = OuterSteps.steps.findIndex(
        (item) => item._id.toString() === innerId
      );

      if (findIndex !== -1) {
        OuterSteps.steps.splice(findIndex, 1);
        await OuterSteps.save();

        return res
          .status(200)
          .json({ message: "Inner data deleted successfully", status: true });
      } else {
        return res
          .status(404)
          .json({ error: "Inner data not found", status: false });
      }
    } else {
      return res
        .status(404)
        .json({ error: "Parent data not found", status: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

/*
const XLSX = require('xlsx');
 const fs = require('fs');
app.post("/upload-steps", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded", status: false });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const stepsData = worksheet.map((row) => ({
      name: row.name,
      description: row.description,
      // Add other fields here if needed
    }));

    const stepsDoc = await StepsModel.insertMany(stepsData);

    fs.unlinkSync(filePath);

    return stepsDoc
      ? res.status(200).json({ message: "Data Added Successfully", status: true, data: stepsDoc })
      : res.status(404).json({ message: "Something Went Wrong", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
});
*/
