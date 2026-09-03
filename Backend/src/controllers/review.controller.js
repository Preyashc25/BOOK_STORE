const reviewModel = require("../models/reviews.model");
const bookModel = require("../models/book.model");
const orderModel = require("../models/order.model");

const updateBookRatings = async (bookId) => {
  const stats = await reviewModel.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: "$book",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await bookModel.findByIdAndUpdate(bookId, {
      ratingAvg: Math.round(stats[0].avgRating * 10) / 10, // round to 1 decimal
      numReviews: stats[0].numReviews,
    });
  } else {
    await bookModel.findByIdAndUpdate(bookId, { ratingAvg: 0, numReviews: 0 });
  }
};

const addBookReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }
    const book = await bookModel.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    const existingReview = await reviewModel.findOne({
      book: bookId,
      user: req.user._id,
    });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this book",
      });
    }

    const hasPurchased = await orderModel.exists({
      user: req.user._id,
      "items.book": bookId,
      orderStatus: "delivered",
    });

    const review = await reviewModel.create({
      book: bookId,
      user: req.user._id,
      rating,
      comment,
      isVerifiedPurchase: !!hasPurchased,
    });

    await updateBookRatings(book._id);

    const populatedReview = await review.populate("user", "name");

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this book",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message,
    });
  }
};

const getBookReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 20, sort = "-createdAt" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      reviewModel
        .find({ book: bookId })
        .populate("user", "name")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      reviewModel.countDocuments({ book: bookId }),
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

const deleteBookReview = async (req, res) => {
  try {
    const review = await reviewModel.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const bookId = review.book;
    await review.deleteOne();
    await updateBookRatings(bookId);
    res.status(200).json({
      success: true,
      message: "Book review deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

const updateBookReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (rating && (rating < 1 || rating > 5)) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }
    const review = await reviewModel.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save()

    await updateBookRatings(review.book);

    const populatedReview = await review.populate("user", "name");
    res.status(200).json({
      success: true,
      review: populatedReview,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

module.exports = {
  addBookReview,
  getBookReview,
  deleteBookReview,
  updateBookReview,
};
