const Course = require("../models/Course");
const { encrypt, decrypt } = require("../utils/cryptoUtil");
const { signData, verifySignature } = require("../utils/signatureUtil");

/**
 * CREATE COURSE (Faculty only)
 * Encrypts sensitive course description
 * Digitally signs course data
 */
exports.createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, description } = req.body;

    // Encrypt description
    const encryptedDescription = encrypt(description);

    // Data to be signed
    const dataToSign = `${courseCode}|${courseName}|${encryptedDescription}`;

    // Generate digital signature
    const digitalSignature = signData(dataToSign);

    const course = new Course({
      courseCode,
      courseName,
      encryptedDescription,
      digitalSignature,
      faculty: req.user.userId
    });

    await course.save();

    res.status(201).json({
      message: "Course created with encrypted data & digital signature"
    });

  } catch (error) {
    res.status(500).json({ message: "Course creation failed" });
  }
};

/**
 * VIEW COURSE (Authorized users)
 * Verifies digital signature before decrypting
 */
exports.viewCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("faculty", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Reconstruct signed data
    const dataToVerify = `${course.courseCode}|${course.courseName}|${course.encryptedDescription}`;

    // Verify digital signature
    const isValid = verifySignature(
      dataToVerify,
      course.digitalSignature
    );

    if (!isValid) {
      return res.status(400).json({
        message: "Data integrity check failed!"
      });
    }

    // Decrypt only if signature is valid
    const decryptedDescription = decrypt(course.encryptedDescription);

    res.json({
      courseCode: course.courseCode,
      courseName: course.courseName,
      description: decryptedDescription,
      verified: true,
      faculty: course.faculty
    });

  } catch (error) {
    res.status(500).json({ message: "Unable to fetch course" });
  }
};

