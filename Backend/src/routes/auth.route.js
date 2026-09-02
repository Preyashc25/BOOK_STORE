const express = require('express');
const authController = require('../controllers/auth.controller')
const router = express.Router();
const protect = require("../middlewares/auth.middleware");

router.post('/register',authController.register)
router.post('/login',authController.login)
router.post('/refresh-token',authController.refreshToken)
router.post('/logout',authController.logout)
router.get('/me',protect,authController.me)


module.exports = router