const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Register
router.post("/register", authController.register);

// Login (Step 1 of MFA - Send OTP)
router.post("/login", authController.login);

// Verify OTP (Step 2 of MFA - Get JWT)
router.post("/verify-otp", authController.verifyOTP);

module.exports = router;
