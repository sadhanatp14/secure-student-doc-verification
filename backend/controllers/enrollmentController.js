const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

/**
 * GET ALL COURSES
 * Any authenticated user can view all courses
 */
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("faculty", "name email");

    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Unable to fetch courses" });
  }
};

/**
 * ENROLL IN A COURSE
 * Students only
 */
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.userId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user.userId,
      course: courseId
    });

    await enrollment.save();

    res.status(201).json({
      message: "Successfully enrolled in course"
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ message: "Unable to enroll in course" });
  }
};

/**
 * GET STUDENT'S ENROLLED COURSES
 * Students only - shows only approved enrollments
 */
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ 
      student: req.user.userId,
      status: "approved" // Only show approved enrollments
    })
      .populate({
        path: "course",
        populate: { path: "faculty", select: "name email" }
      });

    // Extract course details (filter out null courses)
    const courses = enrollments
      .filter(enrollment => enrollment.course) // Filter out null courses
      .map(enrollment => ({
        enrollmentId: enrollment._id,
        ...enrollment.course.toObject()
      }));

    res.json(courses);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ message: "Unable to fetch enrollments" });
  }
};

/**
 * GET COURSE DETAILS WITH FACULTY INFO
 */
exports.getCourseDetail = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("faculty", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Unable to fetch course" });
  }
};

/**
 * GET PENDING ENROLLMENTS FOR FACULTY
 * Faculty only - see pending enrollment requests for their courses
 */
exports.getPendingEnrollments = async (req, res) => {
  try {
    // Find courses taught by this faculty
    const Course = require("../models/Course");
    const courses = await Course.find({ faculty: req.user.userId });
    const courseIds = courses.map(c => c._id);

    // Find pending enrollments for those courses
    const enrollments = await Enrollment.find({
      course: { $in: courseIds },
      status: "pending"
    })
      .populate("student", "name email rollNumber")
      .populate("course", "courseCode courseName");

    // Filter out enrollments with null courses or students
    const validEnrollments = enrollments.filter(enrollment => enrollment.course && enrollment.student);

    res.json(validEnrollments);
  } catch (error) {
    console.error("Error fetching pending enrollments:", error);
    res.status(500).json({ message: "Unable to fetch pending enrollments" });
  }
};

/**
 * APPROVE OR REJECT ENROLLMENT
 * Faculty only
 */
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { enrollmentId, status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate({ path: "course", select: "faculty" });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Check if the faculty owns this course
    if (!enrollment.course?.faculty || enrollment.course.faculty.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    enrollment.status = status;
    if (status === "rejected") {
      if (!rejectionReason || !rejectionReason.trim()) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      enrollment.rejectionReason = rejectionReason.trim();
    } else {
      enrollment.rejectionReason = "";
    }
    await enrollment.save();

    res.json({
      message: `Enrollment ${status} successfully`,
      enrollment
    });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    res.status(500).json({ message: "Unable to update enrollment" });
  }
};

/**
 * GET MY PENDING ENROLLMENTS (Student)
 * Students can see their pending enrollment requests
 */
exports.getMyPendingEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ 
      student: req.user.userId,
      status: "pending"
    })
      .populate({
        path: "course",
        populate: { path: "faculty", select: "name email" }
      });

    // Filter out enrollments with null courses
    const validEnrollments = enrollments.filter(enrollment => enrollment.course);

    res.json(validEnrollments);
  } catch (error) {
    console.error("Error fetching pending enrollments:", error);
    res.status(500).json({ message: "Unable to fetch pending enrollments" });
  }
};

/**
 * GET MY REJECTED ENROLLMENTS (Student)
 * Students can see their rejected enrollment requests
 */
exports.getMyRejectedEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ 
      student: req.user.userId,
      status: "rejected"
    })
      .populate({
        path: "course",
        populate: { path: "faculty", select: "name email" }
      });

    // Filter out enrollments with null courses
    const validEnrollments = enrollments.filter(enrollment => enrollment.course);

    res.json(validEnrollments);
  } catch (error) {
    console.error("Error fetching rejected enrollments:", error);
    res.status(500).json({ message: "Unable to fetch rejected enrollments" });
  }
};

/**
 * GET APPROVED ENROLLMENTS FOR FACULTY
 * Faculty can see approved enrollments for their courses
 */
exports.getApprovedEnrollments = async (req, res) => {
  try {
    // Find courses taught by this faculty
    const courses = await Course.find({ faculty: req.user.userId });
    const courseIds = courses.map(c => c._id);

    // Find approved enrollments for those courses
    const enrollments = await Enrollment.find({
      course: { $in: courseIds },
      status: "approved"
    })
      .populate("student", "name email rollNumber")
      .populate("course", "courseCode courseName")
      .sort({ updatedAt: -1 });

    // Filter out enrollments with null courses or students
    const validEnrollments = enrollments.filter(enrollment => enrollment.course && enrollment.student);

    res.json(validEnrollments);
  } catch (error) {
    console.error("Error fetching approved enrollments:", error);
    res.status(500).json({ message: "Unable to fetch approved enrollments" });
  }
};

/**
 * GET ALL APPROVED ENROLLMENTS (Admin)
 * Admins can see all approved enrollments and filter by course/faculty on the client
 */
exports.getAllApprovedEnrollmentsAdmin = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ status: "approved" })
      .populate({
        path: "course",
        select: "courseCode courseName faculty",
        populate: { path: "faculty", select: "name email" }
      })
      .populate("student", "name email rollNumber")
      .sort({ updatedAt: -1 });

    const validEnrollments = enrollments.filter(
      enrollment => enrollment.course && enrollment.student
    );

    res.json(validEnrollments);
  } catch (error) {
    console.error("Error fetching all approved enrollments (admin):", error);
    res.status(500).json({ message: "Unable to fetch approved enrollments" });
  }
};

/**
 * DELETE ENROLLMENT (Admin)
 * Admin can remove any enrollment; affects student/faculty views immediately
 */
exports.deleteEnrollmentAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    await enrollment.deleteOne();

    res.json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error("Error deleting enrollment (admin):", error);
    res.status(500).json({ message: "Unable to delete enrollment" });
  }
};
