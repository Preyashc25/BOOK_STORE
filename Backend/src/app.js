const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const authRouter = require("./routes/auth.route");
const bookRouter = require("./routes/book.route");
const cartRouter = require("./routes/cart.route");
const categoryRouter = require("./routes/category.route");
const orderRouter = require("./routes/order.route");
const reviewRouter = require("./routes/reviews.route");
const userRouter = require("./routes/user.route");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);
app.use("/api/category", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRouter);
app.use("/api/users", userRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
