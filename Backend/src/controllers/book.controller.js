const bookModel = require("../models/book.model");
const cloudinary = require("../configs/cloudinary");
const { all } = require("../routes/book.route");
const { json } = require("express");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "bookStore/books" },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
};

const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      price,
      description,
      discountPercent,
      stock,
      category,
      language,
      pages,
      publisher,
      publishDate,
    } = req.body;

    if (!title || !price || !description || !author || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields are missing..." });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromise = req.files.map((file) =>
        uploadToCloudinary(file.buffer),
      );
      images = await Promise.all(uploadPromise);
    }

    const book = await bookModel.create({
      title,
      author,
      isbn,
      price,
      description,
      discountPercent,
      stock,
      category,
      language,
      pages,
      publisher,
      publishDate,
    });

    res.status(201).json({ success: true, book });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "ISBN already exists.." });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create book",
      error: error.message,
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await bookModel.findById(bookId);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book Not Found" });
    }

    if (req.files && req.files.length > 0) {
      const deletePromises = book.images.map((img) =>
        cloudinary.uploader.destroy(img.publicId),
      );
      await Promise.all(deletePromises);
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer),
      );
      req.body.images = await Promise.all(uploadPromises);
    }

    const updateBook = await bookModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidator: true },
    );

    res.status(200).json({ success: true, book: updateBook });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid book ID" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update book",
      error: error.message,
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const bookToDelete = await bookModel.findById(bookId);

    if (!bookToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Book Not Found" });
    }
    if (bookToDelete.images && bookToDelete.images.length > 0) {
      const deletePromises = bookToDelete.images.map((img) =>
        cloudinary.uploader.destroy(img.publicId),
      );
      await Promise.all(deletePromises);
    }

    await bookToDelete.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Book Deleted Successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid book ID" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message,
    });
  }
};

const getAllBook = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      author,
      sort = "-createdAt",
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (author) {
      query.author = { $regex: author, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [books, total] = await Promise.all([
      bookModel
        .find(query)
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      bookModel.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
      error: error.message,
    });
  }
};

const getBooksByCategory = async (req, res) => {
  try {
    const Category = require("../models/category.model");
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category Not Found" });
    }
    const books = await bookModel
      .find({ category: category._id })
      .populate("category", "name slug");

    res.status(200).json({ success: true, count: books.length, books });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
      error: error.message,
    });
  }
};

const getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await bookModel
      .findById(bookId)
      .populate("category", "name slug");
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not Found",
      });
    }

    res.status(200).json({ success: true, book });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid book ID" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch book",
      error: error.message,
    });
  }
};

module.exports = {
  createBook,
  updateBook,
  deleteBook,
  getAllBook,
  getBooksByCategory,
  getBookById,
};
