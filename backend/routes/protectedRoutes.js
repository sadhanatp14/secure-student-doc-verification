const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// STUDENT
router.get(
  "/student",
  verifyToken,
  allowRoles("student"),
  (req, res) => {
    res.json({ message: "Student content accessed" });
  }
);

// FACULTY
router.get(
  "/faculty",
  verifyToken,
  allowRoles("faculty"),
  (req, res) => {
    res.json({ message: "Faculty content accessed" });
  }
);

// ADMIN
router.get(
  "/admin",
  verifyToken,
  allowRoles("admin"),
  (req, res) => {
    res.json({ message: "Admin content accessed" });
  }
);

module.exports = router;
