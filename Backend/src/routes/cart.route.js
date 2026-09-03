const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/", protect, cartController.getUserCart);
router.post("/add", protect, cartController.addToCart);
router.put("/update", protect, cartController.updateItemQty);
router.delete("/remove/:bookId", protect, cartController.removeBookFromCart);
router.delete("/clear", protect, cartController.clearCart);

module.exports = router;
