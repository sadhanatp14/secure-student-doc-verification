const express = require("express");
const router = express.Router();

// Basic health/ping for auth
router.get("/ping", (req, res) => {
  res.json({ message: "Auth route is reachable" });
});

// Temporary register endpoint stub so POST /api/auth/register works
router.post("/register", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  // In a real implementation you would hash the password, save user, and return a token
  res.status(201).json({ message: "User registered (stub)", email });
});

module.exports = router;
