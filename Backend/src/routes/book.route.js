const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");


router.get("/", bookController.getAllBook);
router.get("/:id", bookController.getBookById);
router.post("/", protect, isAdmin, bookController.createBook);
router.put("/:id", protect, isAdmin, bookController.updateBook);
router.delete("/:id", protect, isAdmin, bookController.deleteBook);
router.get("/category/:slug", bookController.getBooksByCategory);

module.exports = router;
