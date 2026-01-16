const Course = require("../models/Course");
const { encrypt, decrypt } = require("../utils/cryptoUtil");

/**
 * CREATE COURSE (Faculty only)
 * Encrypts sensitive course description before storing
 */
exports.createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, description } = req.body;

    // Encrypt sensitive field
    const encryptedDescription = encrypt(description);

    const course = new Course({
      courseCode,
      courseName,
      encryptedDescription,
      faculty: req.user.userId   // extracted from JWT
    });

    await course.save();

    res.status(201).json({
      message: "Course created successfully with encrypted data"
    });

  } catch (error) {
    res.status(500).json({ message: "Course creation failed" });
  }
};

/**
 * VIEW COURSE (Authorized users)
 * Decrypts data before sending to client
 */
exports.viewCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("faculty", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const decryptedDescription = decrypt(course.encryptedDescription);

    res.json({
      courseCode: course.courseCode,
      courseName: course.courseName,
      description: decryptedDescription,
      faculty: course.faculty
    });

  } catch (error) {
    res.status(500).json({ message: "Unable to fetch course" });
  }
};
