const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const enrollmentController = require("../controllers/enrollmentController");

// GET all courses (any authenticated user)
router.get("/courses", verifyToken, enrollmentController.getAllCourses);

// GET course details (any authenticated user)
router.get("/courses/:id", verifyToken, enrollmentController.getCourseDetail);

// ENROLL in a course (students only)
router.post(
  "/enroll",
  verifyToken,
  allowRoles("student"),
  enrollmentController.enrollCourse
);

// GET my enrollments (students only)
router.get(
  "/my-enrollments",
  verifyToken,
  allowRoles("student"),
  enrollmentController.getMyEnrollments
);

// GET my pending enrollments (students only)
router.get(
  "/my-pending",
  verifyToken,
  allowRoles("student"),
  enrollmentController.getMyPendingEnrollments
);

// GET my rejected enrollments (students only)
router.get(
  "/my-rejected",
  verifyToken,
  allowRoles("student"),
  enrollmentController.getMyRejectedEnrollments
);

// GET pending enrollments for faculty's courses (faculty only)
router.get(
  "/pending",
  verifyToken,
  allowRoles("faculty", "admin"),
  enrollmentController.getPendingEnrollments
);

// GET approved enrollments for faculty's courses (faculty only)
router.get(
  "/approved",
  verifyToken,
  allowRoles("faculty", "admin"),
  enrollmentController.getApprovedEnrollments
);

// GET all approved enrollments (admin only)
router.get(
  "/all-approved",
  verifyToken,
  allowRoles("admin"),
  enrollmentController.getAllApprovedEnrollmentsAdmin
);

// DELETE enrollment (admin only)
router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  enrollmentController.deleteEnrollmentAdmin
);

// UPDATE enrollment status (faculty only)
router.post(
  "/update-status",
  verifyToken,
  allowRoles("faculty", "admin"),
  enrollmentController.updateEnrollmentStatus
);

module.exports = router;
