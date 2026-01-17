const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    unique: true,
    required: true
  },

  courseName: {
    type: String,
    required: true
  },

  // 🔐 Encrypted sensitive data
  encryptedDescription: {
    type: String,
    required: true
  },

  // ✍️ ADD THIS HERE: Proves the data hasn't been tampered with
  digitalSignature: {
    type: String,
    required: true
  },

  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema);
