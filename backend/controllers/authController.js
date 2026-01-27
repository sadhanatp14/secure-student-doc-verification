const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyInviteToken } = require("../utils/inviteTokenUtil");
const { generateOTP, sendOTPEmail, isOTPValid } = require("../utils/otpUtil");

exports.register = async (req, res) => {
  try {
    const { name, email, password, rollNumber, inviteToken } = req.body;

    if (!inviteToken) {
      return res.status(400).json({
        message: "Invitation token required"
      });
    }

    // Verify invite token
    const payload = verifyInviteToken(inviteToken);

    if (payload.email !== email) {
      return res.status(403).json({
        message: "Invite token does not match email"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      rollNumber: rollNumber || null,
      role: payload.role, // 🔐 role comes ONLY from token
      isVerified: true
    });

    await user.save();

    res.status(201).json({
      message: "User registered via invitation successfully"
    });

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired invitation token"
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Password is correct - Generate and send OTP
    const otp = generateOTP();
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }

    // Store OTP in database
    await OTP.findOneAndUpdate(
      { email },
      { email, code: otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000), attempts: 0 },
      { upsert: true }
    );

    res.json({
      message: "OTP sent to your email. Please verify to complete login.",
      email: email, // Send email so frontend knows which email to verify
      requiresOTP: true
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * VERIFY OTP (Multi-Factor Authentication)
 * Second factor of authentication
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and OTP code required" });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(401).json({ message: "OTP expired or not found" });
    }

    // Check if OTP is still valid
    if (!isOTPValid(otpRecord, new Date())) {
      await OTP.deleteOne({ email });
      return res.status(401).json({ message: "OTP has expired. Please login again." });
    }

    // Check max attempts (3 attempts allowed)
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email });
      return res.status(401).json({ message: "Too many failed attempts. Please login again." });
    }

    // Verify OTP code
    if (otpRecord.code !== code) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(401).json({ 
        message: "Invalid OTP code",
        attemptsRemaining: 3 - otpRecord.attempts
      });
    }

    // OTP is correct - Generate JWT token
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Delete OTP record after successful verification
    await OTP.deleteOne({ email });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        role: user.role
      }
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

