const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

// GET all students (admin only)
router.get(
  "/students",
  verifyToken,
  allowRoles("admin"),
  userController.getAllStudents
);

// GET all faculty (admin only)
router.get(
  "/faculty",
  verifyToken,
  allowRoles("admin"),
  userController.getAllFaculty
);

// DELETE user (admin only - cannot delete admin accounts)
router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  userController.deleteUser
);

module.exports = router;
