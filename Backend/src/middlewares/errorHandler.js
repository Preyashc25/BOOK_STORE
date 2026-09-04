const ApiError = require("../utils/apiError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }
  if (err.code === 11000) {
    statusCode = 409;
    const field = ObjectId.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large — max size is 5MB";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // only leak stack traces in dev
  });
};

const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found — ${req.originalUrl}`);
  next(error);
};

module.exports = { errorHandler, notFound };
