const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Generate invite token (Admin only)
router.post(
  "/invite",
  verifyToken,
  allowRoles("admin"),
  adminController.createInvite
);

module.exports = router;

