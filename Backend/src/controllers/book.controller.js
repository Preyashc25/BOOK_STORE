const mongoose = require("mongoose");
const bookModel = require("../models/book.model");
const categoryModel = require("../models/category.model");
const cloudinary = require("../configs/cloudinary");

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
      languages,
      page,
      publisher,
      pubishDate,
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
    } else if (req.body.imageUrl) {
      images = [{ url: req.body.imageUrl }];
    } else if (req.body.images) {
      try {
        images = typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
      } catch {
        images = [{ url: req.body.images }];
      }
    }

    const bookData = {
      title,
      author,
      price: Number(price),
      description,
      stock: Number(stock) || 0,
      category,
      images,
      languages: languages || "English",
    };

    if (isbn && isbn.trim()) bookData.isbn = isbn.trim();
    if (discountPercent !== undefined && discountPercent !== "") bookData.discountPercent = Number(discountPercent);
    if (page !== undefined && page !== "") bookData.page = Number(page);
    if (publisher && publisher.trim()) bookData.publisher = publisher.trim();
    if (pubishDate && pubishDate !== "") bookData.pubishDate = new Date(pubishDate);

    const book = await bookModel.create(bookData);

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

    if (req.files?.length) {
      // Try to delete old images from Cloudinary, but don't block the update if it fails
      try {
        const deletePromises = (book.images || [])
          .filter((img) => img && img.publicId)
          .map((img) => cloudinary.uploader.destroy(img.publicId));
        await Promise.all(deletePromises);
      } catch (deleteErr) {
        console.warn("Failed to delete old images from Cloudinary:", deleteErr.message);
      }
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer),
      );
      req.body.images = await Promise.all(uploadPromises);
    } else if (req.body.imageUrl) {
      req.body.images = [{ url: req.body.imageUrl }];
    } else if (req.body.images && typeof req.body.images === "string") {
      try {
        req.body.images = JSON.parse(req.body.images);
      } catch {
        req.body.images = [{ url: req.body.images }];
      }
    }

    const updateData = { ...req.body };
    delete updateData.imageUrl;

    if (updateData.price !== undefined && updateData.price !== "") {
      updateData.price = Number(updateData.price);
    }
    if (updateData.stock !== undefined && updateData.stock !== "") {
      updateData.stock = Number(updateData.stock);
    }
    if (updateData.discountPercent !== undefined && updateData.discountPercent !== "") {
      updateData.discountPercent = Number(updateData.discountPercent);
    }
    if (updateData.page !== undefined) {
      if (updateData.page === "") delete updateData.page;
      else updateData.page = Number(updateData.page);
    }
    if (updateData.isbn !== undefined) {
      if (!updateData.isbn || !updateData.isbn.trim()) delete updateData.isbn;
      else updateData.isbn = updateData.isbn.trim();
    }
    if (updateData.pubishDate !== undefined) {
      if (!updateData.pubishDate) delete updateData.pubishDate;
      else updateData.pubishDate = new Date(updateData.pubishDate);
    }

    const updatedBook = await bookModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, book: updatedBook });
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

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      const escapedSearch = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");

      // Also search by category/genre name so searching "Fiction" or "Fantasy" finds books in that genre
      const matchedCategories = await categoryModel.find({
        $or: [{ name: searchRegex }, { slug: searchRegex }],
      }).select("_id");

      const orConditions = [
        { title: searchRegex },
        { author: searchRegex },
        { isbn: searchRegex },
        { description: searchRegex },
      ];

      if (matchedCategories.length > 0) {
        orConditions.push({
          category: { $in: matchedCategories.map((c) => c._id) },
        });
      }

      query.$or = orConditions;
    }

    if (category && category !== "all" && category !== "genres") {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const categoryDoc = await categoryModel.findOne({
          $or: [
            { slug: category.toLowerCase() },
            { name: new RegExp(`^${category}$`, "i") },
          ],
        });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          return res.status(200).json({
            success: true,
            count: 0,
            total: 0,
            totalPages: 0,
            currentPage: Number(page),
            books: [],
          });
        }
      }
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
