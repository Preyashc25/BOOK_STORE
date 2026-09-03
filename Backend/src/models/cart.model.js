const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "books",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
      priceAtAdd: {
        type: Number,
      },
    },
  ],
},{
    timestamps:true
});

const cartModel = mongoose.model("cart", cartSchema);
module.exports = cartModel;
