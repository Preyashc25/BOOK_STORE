const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

router.post("/:bookId", protect, reviewController.addBookReview);
router.get("/:bookId", protect, reviewController.getBookReview);
router.delete("/:id", protect, isAdmin, reviewController.deleteBookReview);
router.put("/:id", protect, reviewController.updateBookReview);
module.exports = router;
