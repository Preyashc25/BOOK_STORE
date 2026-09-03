const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

router.post("/", protect, orderController.placeOrder);
router.get("/my-order", protect, orderController.myOrder);
router.get("/:id", protect, orderController.getSingleOrderDetail);
router.get("/", protect, isAdmin, orderController.getAllOrders);
router.put("/:id/status", protect, isAdmin, orderController.updateStatus);
router.post("/verify-payment", protect, orderController.verifyPayment);

module.exports = router;
