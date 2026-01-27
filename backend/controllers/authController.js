const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyInviteToken } = require("../utils/inviteTokenUtil");

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

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

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
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

