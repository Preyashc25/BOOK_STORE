const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");


router.get("/", bookController.getAllBook);
router.get("/category/:slug", bookController.getBooksByCategory);
router.get("/:id", bookController.getBookById);
router.post("/", protect, isAdmin, upload.array("images", 5), bookController.createBook);
router.put("/:id", protect, isAdmin, upload.array("images", 5), bookController.updateBook);
router.delete("/:id", protect, isAdmin, bookController.deleteBook);

module.exports = router;
