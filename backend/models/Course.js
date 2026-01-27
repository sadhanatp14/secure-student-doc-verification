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

  // � Public description (visible to students)
  description: {
    type: String,
    required: true
  },

  // 🔐 Encrypted course plan (only for faculty/admin)
  encryptedCoursePlan: {
    type: String,
    required: true
  },

  // ✍️ Digital signature for data integrity
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
