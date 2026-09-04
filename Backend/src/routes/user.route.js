const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", isAdmin, userController.getAllUsers);
router.put("/:id", userController.updateUser);
router.delete("/:id", isAdmin, userController.deleteUser);
router.get("/dashboard-status", isAdmin, userController.getDashboardStatus);

module.exports = router;
