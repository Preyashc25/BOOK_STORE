const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected Successfully...");
  } catch (error) {
    console.log("Error While Connecting to DB", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
