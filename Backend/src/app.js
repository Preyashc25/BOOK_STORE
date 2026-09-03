const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const connectDB = require("./configs/db");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.route");
const bookRouter = require("./routes/book.route");
const cartRouter = require("./routes/cart.route");
const categoryRouter = require("./routes/category.route");
const orderRouter = require("./routes/order.route");
const reviewRouter = require("./routes/reviews.route");
const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);
app.use("/api/category", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRouter);

module.exports = app;
