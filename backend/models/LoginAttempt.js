const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  blockedUntil: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // TTL: Auto-delete after 5 minutes
  }
});

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);
