import { StepsModel } from "../model/steps.model.js";

export const createSteps = async (req, res, next) => {
  try {
    const { createdBy, steps } = req.body;

    const findSteps = await StepsModel.findOne({ createdBy });

    if (findSteps) {
      if (req.body.innerId) {
        const innerId = req.body.innerId;
        const findIndex = findSteps.steps.findIndex(
          (item) => item._id.toString() === innerId
        );

        if (findIndex !== -1) {
          findSteps.steps[findIndex] = {
            ...findSteps.steps[findIndex]._doc,
            ...req.body,
          };
          await findSteps.save();
          return res
            .status(200)
            .json({ message: "Data Updated Successfully", status: true });
        } else {
          return res
            .status(404)
            .json({ message: "Step with innerId not found", status: false });
        }
      } else {
        if (Array.isArray(steps)) {
          steps.forEach((step) => {
            findSteps.steps.push(step);
          });
        } else {
          findSteps.steps.push(steps);
        }
        await findSteps.save();
        return res
          .status(200)
          .json({ message: "Steps Added Successfully", status: true });
      }
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
    const steps = await StepsModel.find({ createdBy: id }).sort({
      sortorder: -1,
    });
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
