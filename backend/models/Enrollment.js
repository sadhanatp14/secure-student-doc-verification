const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  rejectionReason: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
