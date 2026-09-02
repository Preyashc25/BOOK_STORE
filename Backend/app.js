const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./configs/db");
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.route')
const app = express();
connectDB();

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use('/api/auth',authRouter)

module.exports = app;
