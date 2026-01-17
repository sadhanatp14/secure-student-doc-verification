const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  createCourse,
  viewCourse,
  encodeCourse, // ✅ Added
  decodeCourse  // ✅ Added
} = require("../controllers/courseController");

const router = express.Router();

// 1. CREATE COURSE → Faculty/Admin (Authorization: Restricted)
router.post(
  "/",
  verifyToken,
  allowRoles("faculty", "admin"),
  createCourse
);

// 2. VIEW DECRYPTED COURSE → Faculty/Admin ONLY (Authorization: Highly Restricted)
router.get(
  "/:id",
  verifyToken,
  allowRoles("faculty", "admin"),
  viewCourse
);

// 3. ENCODE COURSE → Any authenticated user (Authorization: General)
router.get(
  "/encode/:id",
  verifyToken,
  encodeCourse
);

// 4. DECODE BASE64 DATA → Any authenticated user (Authorization: General)
router.post(
  "/decode",
  verifyToken,
  decodeCourse
);

module.exports = router;

