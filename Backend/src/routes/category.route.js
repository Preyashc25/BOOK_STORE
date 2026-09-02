const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

router.get("/", categoryController.getAllCategory);
router.post("/", protect, isAdmin, categoryController.createCategory);
router.delete("/:id", protect, isAdmin, categoryController.deleteCategory);

module.exports = router;
