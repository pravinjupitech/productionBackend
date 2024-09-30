import { AssignProduction } from "../model/assignProduction.model.js";

export const assignProduct = async (req, res, next) => {
  try {
    const product = await AssignProduction.create(req.body);
    return product
      ? res.status(200).json({ message: "Data Added", status: true })
      : res
          .status(404)
          .json({ message: "Something Went Wrong", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewProduct = async (req, res, next) => {
  try {
    const product = await AssignProduction.find({
      database: req.params.database,
    }).sort({ sortorder: -1 });
    return product.length > 0
      ? res.status(200).json({ message: "Data Found", product, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewByIdProduct = async (req, res, next) => {
  try {
    const product = await AssignProduction.findById(req.params.id);
    return product
      ? res.status(200).json({ message: "Data Found", product, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    let id = req.params.id;
    const product = await AssignProduction.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    const updateData = req.body;
    await AssignProduction.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Data Updated", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await AssignProduction.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    await AssignProduction.findByIdAndDelete(id);
    res.status(200).json({ message: "Data Deleted", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const demoProduct = async (req, res, next) => {
  try {
    let arr = [1, 2, 3, 3, 4, 5, 5, 5];
    let frequency = {};
    let repeatedNumbers = [];
    for (let num of arr) {
      frequency[num] = (frequency[num] || 0) + 1;
    }
    for (let num in frequency) {
      if (frequency[num] > 1) {
        repeatedNumbers.push(Number(num));
      }
    }
    console.log("Repeated numbers:", repeatedNumbers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};


/*
// Function to move an element up
function moveUp(arr, index) {
  if (index <= 0 || index >= arr.length) return arr; // Out of bounds, no action
  // Swap current element with the previous one
  [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
  return arr;
}

// Function to move an element down
function moveDown(arr, index) {
  if (index < 0 || index >= arr.length - 1) return arr; // Out of bounds, no action
  // Swap current element with the next one
  [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
  return arr;
}

// Example usage:
let array = [10, 20, 30, 40, 50];

console.log("Initial Array:", array);

array = moveUp(array, 2);  // Move the element at index 2 (30) up
console.log("After Moving Up:", array);

array = moveDown(array, 1);  // Move the element at index 1 (30) down
console.log("After Moving Down:", array);

*/
