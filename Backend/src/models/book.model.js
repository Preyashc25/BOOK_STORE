const mongoose = require("mongoose");
const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    languages: {
      type: String,
      default: "English",
    },
    page: {
      type: Number,
    },
    publisher: {
      type: String,
    },
    pubishDate: {
      type: Date,
    },
    ratingAvg: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

bookSchema.index({ title: "text", author: "text", description: "text" });

bookSchema.virtual("finalPrice").get(function () {
  return this.price - (this.price * this.discountPercent) / 100;
});

const bookModel = mongoose.model("books", bookSchema);
module.exports = bookModel;
