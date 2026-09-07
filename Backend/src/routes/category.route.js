const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

router.get("/", categoryController.getAllCategory);
router.post("/", protect, isAdmin, categoryController.createCategory);
router.put("/:id", protect, isAdmin, categoryController.updateCategory);
router.delete("/:id", protect, isAdmin, categoryController.deleteCategory);

module.exports = router;
