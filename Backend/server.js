const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
const connectDB = require("./src/configs/db");

const PORT_NO = process.env.PORT_NO || 3000;

connectDB().then(() => {
  const server = app.listen(PORT_NO, () => {
    console.log(
      `Server running on port ${PORT_NO} in ${process.env.NODE_ENV || "development"} mode`,
    );
  });
  process.on("unhandledRejection", (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
