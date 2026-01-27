const User = require("../models/User");

/**
 * GET ALL STUDENTS (Admin)
 */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Unable to fetch students" });
  }
};

/**
 * GET ALL FACULTY (Admin)
 */
exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(faculty);
  } catch (error) {
    console.error("Error fetching faculty:", error);
    res.status(500).json({ message: "Unable to fetch faculty" });
  }
};

/**
 * DELETE USER (Admin)
 * Admin can delete any student or faculty account
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves or other admins
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin accounts" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Unable to delete user" });
  }
};
