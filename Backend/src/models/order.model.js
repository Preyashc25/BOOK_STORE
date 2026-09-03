const mongoose = require("mongoose");
const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "books",
          required: true,
        },
        title: String,
        price: Number,
        quantity: Number,
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ["razorpay", "strip", "cod"],
        default: "razorpay",
      },
      paymentId: String,
      orderId: String,
      signature: String,
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
    },
    itemsPrice: Number,
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalAmount: Number,
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    deliveredAt: Date,
  },
  {
    timestmaps: true,
  },
);

const orderModel = mongoose.model("order", orderSchema);
module.exports = orderModel;
