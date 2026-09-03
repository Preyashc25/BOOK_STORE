const crypto = require("crypto");
const mongoose = require("mongoose");
const orderModel = require("../models/order.model");
const cartModel = require("../models/cart.model");
const bookModel = require("../models/book.model");
const razorpay = require("../configs/razorpay");

const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { shippingAddress } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.pincode ||
      !shippingAddress.street
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }
    const cart = await cartModel
      .findOne({ user: req.user._id })
      .populate("items.book");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    for (const item of cart.items) {
      if (!item.book) {
        return res.status(400).json({
          success: false,
          message: "One of the items in your cart no longer exists ",
        });
      }
      if (item.book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `"${item.book.title}" only has ${item.book.stock} unit(s) left`,
        });
      }
    }
    const itemsPrice = cart.items.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0,
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const totalAmount = itemsPrice + shippingPrice;

    const order = await orderModel.create({
      user: req.user._id,
      items: cart.items.map((item) => ({
        book: item.book._id,
        title: item.book.title,
        price: item.priceAtAdd,
        quantity: item.quantity,
      })),
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
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
const verifyPayment = async (req, res) => {
  const session = mongoose.startSession();
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
    (await session).startTransaction();

    const order = await orderModel.findById(orderId).session(session);
    if (!order) {
      (await session).abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.paymentInfo.status === "paid") {
      (await session).abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Order already paid" });
    }

    for (const item of order.items) {
      const updated = await bookModel.findOneAndUpdate(
        { _id: item.book, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session, new: true },
      );

      if (!updated) {
        (await session).abortTransaction();
        return res.status(409).json({
          success: false,
          message: `"${item.title}" went out of stock while payment was processing. You have not been charged — please contact support to confirm refund.`,
        });
      }
    }
    order.paymentInfo.paymentId = razorpay_payment_id;
    order.paymentInfo.signature = razorpay_signature;
    order.paymentInfo.status = "paid";
    await order.save({ session });

    await cartModel.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { session },
    );
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Payment verification done successfully",
    });
  } catch (error) {
    (await session).abortTransaction;
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  } finally {
    (await session).endSession();
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
