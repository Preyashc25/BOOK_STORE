const userModel = require("../models/user.model");
const orderModel = require("../models/order.model");
const bookModel = require("../models/book.model");

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      userModel
        .find(query)
        .select("-password -refreshToken")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      userModel.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};
const updateUser = async (req, res) => {
  try {
    if (
      req.params.id !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const { name, address } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (address) updateFields.address = address;
    const user = await userModel
      .findByIdAndUpdate(
        req.params.id,
        {
          $set: updateFields,
        },
        { new: true, runValidators: true },
      )
      .select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    if (
      req.params.id !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await user.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
const getDashboardStatus = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBooks,
      totalOrders,
      revenueResult,
      recentOrders,
      lowStockBooks,
      orderStatusCounts,
    ] = await Promise.all([
      userModel.countDocuments({ role: "user" }),
      bookModel.countDocuments(),
      orderModel.countDocuments(),
      orderModel.aggregate([
        {
          $match: {
            $or: [
              { "paymentInfo.status": "paid" },
              { "paymentInfo.method": "cod" },
            ],
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      orderModel
        .find()
        .populate("user", "name email")
        .sort("-createdAt")
        .limit(5),
      bookModel
        .find({ stock: { $lte: 5 } })
        .select("title stock")
        .limit(10),
      orderModel.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const ordersByStatus = (orderStatusCounts || []).reduce((acc, item) => {
      if (item._id) acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalBooks: totalBooks || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        recentOrders: recentOrders || [],
        lowStockBooks: lowStockBooks || [],
        ordersByStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  getDashboardStatus,
};
