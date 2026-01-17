const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  createCourse,
  viewCourse
} = require("../controllers/courseController");

const router = express.Router();

// CREATE COURSE → Faculty/Admin
router.post(
  "/",
  verifyToken,
  allowRoles("faculty", "admin"),
  createCourse
);

// VIEW DECRYPTED COURSE → Faculty/Admin ONLY
router.get(
  "/:id",
  verifyToken,
  allowRoles("faculty", "admin"),
  viewCourse
);

module.exports = router;


