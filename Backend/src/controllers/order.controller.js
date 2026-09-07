const crypto = require("crypto");
const mongoose = require("mongoose");
const orderModel = require("../models/order.model");
const cartModel = require("../models/cart.model");
const bookModel = require("../models/book.model");
const razorpay = require("../configs/razorpay");

const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, items } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    let orderItems = [];

    // If client provided items directly (e.g. from frontend cart)
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const bookId = item.bookId || item.book?._id || item.book;
        const qty = Number(item.quantity || item.qty || 1);

        if (!bookId) continue;

        const book = await bookModel.findById(bookId);
        if (!book) {
          return res.status(400).json({
            success: false,
            message: "One of the books in your order no longer exists",
          });
        }

        if (book.stock < qty) {
          return res.status(400).json({
            success: false,
            message: `"${book.title}" only has ${book.stock} unit(s) left`,
          });
        }

        const price =
          book.discountPercent > 0
            ? book.price - (book.price * book.discountPercent) / 100
            : book.price;

        orderItems.push({
          book: book._id,
          title: book.title,
          price,
          quantity: qty,
        });
      }
    } else {
      // Fallback to backend cartModel
      const cart = await cartModel
        .findOne({ user: req.user._id })
        .populate("items.book");

      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
      }

      for (const item of cart.items) {
        if (!item.book) {
          return res.status(400).json({
            success: false,
            message: "One of the items in your cart no longer exists",
          });
        }
        if (item.book.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `"${item.book.title}" only has ${item.book.stock} unit(s) left`,
          });
        }
        const price =
          item.priceAtAdd ??
          (item.book.discountPercent > 0
            ? item.book.price - (item.book.price * item.book.discountPercent) / 100
            : item.book.price);

        orderItems.push({
          book: item.book._id,
          title: item.book.title,
          price,
          quantity: item.quantity,
        });
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid items in order",
      });
    }

    const itemsPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const totalAmount = itemsPrice + shippingPrice;

    const order = await orderModel.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      totalAmount,
      paymentInfo: { method: "razorpay", status: "pending" },
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.paymentInfo.orderId = razorpayOrder.id;
    await order.save();

    // Clear any stale cart entries in MongoDB for this user
    await cartModel.findOneAndUpdate(
      { user: req.user._id },
      { items: [] }
    );

    res.status(201).json({
      success: true,
      order,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      razorpayKeyId: process.env.RAZOR_PAY_KEY_ID,
    });
  } catch (error) {
    console.error("placeOrder error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  let session = null;
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZOR_PAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed — signature mismatch",
      });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.paymentInfo.status === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Order already paid" });
    }

    // Attempt MongoDB session/transaction if replica set supports it
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (sessionErr) {
      session = null;
    }

    // Decrement stock for each item atomically
    for (const item of order.items) {
      const query = { _id: item.book, stock: { $gte: item.quantity } };
      const update = { $inc: { stock: -item.quantity } };
      const options = session ? { session, new: true } : { new: true };

      const updated = await bookModel.findOneAndUpdate(query, update, options);

      if (!updated) {
        if (session && session.inTransaction()) {
          await session.abortTransaction();
        }
        return res.status(409).json({
          success: false,
          message: `"${item.title}" went out of stock while payment was processing. Please contact support.`,
        });
      }
    }

    order.paymentInfo.paymentId = razorpay_payment_id;
    order.paymentInfo.signature = razorpay_signature;
    order.paymentInfo.status = "paid";
    await order.save(session ? { session } : undefined);

    await cartModel.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      session ? { session } : undefined,
    );

    if (session && session.inTransaction()) {
      await session.commitTransaction();
    }

    res.status(200).json({
      success: true,
      message: "Payment verification done successfully",
      order,
    });
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("verifyPayment error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
const myOrder = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user._id })
      .sort("-createdAt");
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "failed to fetch order",
      error: error.message,
    });
  }
};
const getSingleOrderDetail = async (req, res) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .populate("items.book", "title images");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      orderModel
        .find(query)
        .populate("user", "name email")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      orderModel.countDocuments(query),
    ]);
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};
const updateStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ["processing", "shipped", "delivered", "cancelled"];

    if (!validStatuses.includes(orderStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Status" });
    }
    const order = await orderModel.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not Found" });
    }
    order.orderStatus = orderStatus;
    if (orderStatus === "delivered") {
      order.deliveredAt = Date.now();
    }
    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
module.exports = {
  placeOrder,
  verifyPayment,
  myOrder,
  getSingleOrderDetail,
  getAllOrders,
  updateStatus,
};
