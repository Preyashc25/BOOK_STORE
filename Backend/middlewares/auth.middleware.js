const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized,no Token" });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token invalid or expired",
      });
    }

    const user = await userModel
      .findById(decoded.id)
      .select("-password -refreshToken");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer Exists..." });
    }
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Auth check fail",
        error: error.message,
      });
  }
};

module.exports = protect;