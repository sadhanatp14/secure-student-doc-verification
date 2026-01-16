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
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema);

