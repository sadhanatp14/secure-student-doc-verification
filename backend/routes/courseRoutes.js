const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  createCourse,
  viewCourse
} = require("../controllers/courseController");

const router = express.Router();

// Faculty creates encrypted course
router.post(
  "/",
  verifyToken,
  allowRoles("faculty", "admin"),
  createCourse
);

// Student views decrypted course
router.get(
  "/:id",
  verifyToken,
  allowRoles("student", "faculty", "admin"),
  viewCourse
);

module.exports = router;


