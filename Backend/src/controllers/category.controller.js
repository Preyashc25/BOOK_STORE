const categoryModel = require("../models/category.model");
const bookModel = require("../models/book.model");

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }
    const slug = generateSlug(name);
    const category = await categoryModel.findOne({
      $or: [{ name: name.trim() }, { slug }],
    });
    if (category) {
      return res
        .status(409)
        .json({ success: false, message: "Category already exists!" });
    }

    const newCategory = await categoryModel.create({
      name: name.trim(),
      slug,
    });

    res.status(201).json({ success: true, newCategory });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Category already exists" });
    }
    return res.status(500).json({
      success: false,
      message: "Category creation failed",
      error: error.message,
    });
  }
};
const getAllCategory = async (req, res) => {
  try {
    const categories = await categoryModel.find().sort("name");
    res
      .status(200)
      .json({ success: true, count: categories.length, categories });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }
    const bookCount = await bookModel.countDocuments({
      category: category._id,
    });
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — ${bookCount} book(s) still assigned to this category. Reassign or delete them first.`,
      });
    }
    await category.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategory,
  deleteCategory
};
