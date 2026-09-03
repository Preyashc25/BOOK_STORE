const cartModel = require("../models/cart.model");
const bookModel = require("../models/book.model");

const getUserCart = async (req, res) => {
  try {
    let cart = await cartModel
      .findOne({ user: req.user._id })
      .populate(
        "items.book",
        "title author price discountPercent images stock",
      );

    if (!cart) {
      return res
        .status(200)
        .json({ success: true, cart: { user: req.user._id, items: [] } });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Cart",
      error: error.message,
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    if (!bookId) {
      return res
        .status(400)
        .json({ success: false, message: "bookId is required" });
    }

    if (quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be at least one " });
    }

    const book = await bookModel.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    if (book.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${book.stock} unit(s) in stock`,
      });
    }

    let cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
      cart = await cartModel.create({
        user: req.user._id,
        items: [
          { book: bookId, quantity, priceAtAdd: book.finalPrice ?? book.price },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.book.toString() === bookId,
      );
      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (book.stock < newQty ) {
          return res.status(400).json({
            success: false,
            message: `Only ${book.stock} unit(s) in stock — you already have ${existingItem.quantity} in cart`,
          });
        }
        existingItem.quantity = newQty;
  
      } else {
        cart.items.push({
          book: bookId,
          quantity,
          priceAtAdd: book.finalPrice ?? book.price,
        });
      }
      await cart.save();
    }
    cart = await cartModel.populate(
      "items.book",
      "title author price discountPercent images stock",
    );
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add to cart",
      error: error.message,
    });
  }
};
const updateItemQty = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    if (!bookId || quantity === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "bookId and quantity are required" });
    }
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1 — use remove instead",
      });
    }
    const book = await bookModel.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    if (book.quantity > book.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${book.stock} unit(s) in stock`,
      });
    }

    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    const item = cart.items.find((item) => item.book.toString() === bookId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not in cart" });
    }
    item.quantity = quantity;
    await cart.save();

    const updateCart = await cart.populate(
      "items.book",
      "title author price discountPercent images stock",
    );

    res.status(200).json({ success: true, updateCart });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error.message,
    });
  }
};
const removeBookFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    if (!bookId) {
      return res
        .status(400)
        .json({ success: false, message: "Book id is required" });
    }
    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.book.toString() !== bookId);

    if (cart.items.length === initialLength) {
      return res
        .status(404)
        .json({ success: false, message: "Item not in cart" });
    }
    await cart.save();
    const updateCart = await cart.populate(
      "items.book",
      "title author price discountPercent images stock",
    );

    res.status(200).json({ success: true, updateCart });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove item",
      error: error.message,
    });
  }
};
const clearCart = async (req, res) => {
  try {
    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart already empty" });
    }
    cart.items = [];
    await cart.save();
    res.status(200).json({ success: false, message: "Cart Cleared" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to clear cart",
        error: error.message,
      });
  }
};
module.exports = {
  getUserCart,
  addToCart,
  updateItemQty,
  removeBookFromCart,
  clearCart
};
