const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

router.post("/create", protect, orderController.placeOrder);
router.post("/verify-payment", protect, orderController.verifyPayment);
router.get("/my-order", protect, orderController.myOrder);
router.get("/", protect, isAdmin, orderController.getAllOrders);
router.put("/:id/status", protect, isAdmin, orderController.updateStatus);
router.get("/:id", protect, orderController.getSingleOrderDetail);

module.exports = router;
