const Course = require("../models/Course");
const { encrypt, decrypt } = require("../utils/cryptoUtil");
const { signData, verifySignature } = require("../utils/signatureUtil");
// ✅ STEP 1.1: ADD THIS LINE BELOW
const { base64Encode, base64Decode } = require("../utils/encodingUtil");

/**
 * CREATE COURSE (Faculty only)
 * Encrypts course plan details
 * Digitally signs course data
 */
exports.createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, description, coursePlan } = req.body;

    // Encrypt course plan (sensitive data)
    const encryptedCoursePlan = encrypt(coursePlan);

    // Data to be signed (includes public data + encrypted plan)
    const dataToSign = `${courseCode}|${courseName}|${description}|${encryptedCoursePlan}`;

    // Generate digital signature
    const digitalSignature = signData(dataToSign);

    const course = new Course({
      courseCode,
      courseName,
      description, // Public description
      encryptedCoursePlan, // Encrypted course plan
      digitalSignature,
      faculty: req.user.userId
    });

    await course.save();

    res.status(201).json({
      message: "Course created with encrypted plan & digital signature"
    });

  } catch (error) {
    console.error("Course creation error:", error);
    res.status(500).json({ message: "Course creation failed" });
  }
};

/**
 * VIEW COURSE (Authorized users)
 * Verifies digital signature before decrypting course plan
 */
exports.viewCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("faculty", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Reconstruct signed data
    const dataToVerify = `${course.courseCode}|${course.courseName}|${course.description}|${course.encryptedCoursePlan}`;

    // Verify digital signature
    const isValid = verifySignature(
      dataToVerify,
      course.digitalSignature
    );

    // Decrypt course plan (allow even if signature invalid for editing old courses)
    let decryptedCoursePlan;
    try {
      decryptedCoursePlan = decrypt(course.encryptedCoursePlan);
    } catch (error) {
      console.error("Decryption failed:", error);
      decryptedCoursePlan = "";
    }

    res.json({
      courseCode: course.courseCode,
      courseName: course.courseName,
      description: course.description, // Public description
      coursePlan: decryptedCoursePlan, // Decrypted plan
      verified: isValid,
      signatureValid: isValid,
      faculty: course.faculty
    });

  } catch (error) {
    console.error("View course error:", error);
    res.status(500).json({ message: "Unable to fetch course" });
  }
};

// ✅ STEP 1.2: ADD NEW ENCODING FUNCTIONS BELOW 👇

/**
 * ENCODE COURSE DETAILS (Base64)
 * Any authenticated user
 */
exports.encodeCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const dataToEncode = `${course.courseCode}|${course.courseName}`;
    const encodedData = base64Encode(dataToEncode);

    res.json({
      encodedData
    });

  } catch (error) {
    res.status(500).json({ message: "Encoding failed" });
  }
};

/**
 * DECODE BASE64 DATA
 */
exports.decodeCourse = async (req, res) => {
  try {
    const { encodedData } = req.body;

    const decodedData = base64Decode(encodedData);
    const [courseCode, courseName] = decodedData.split("|");

    res.json({
      courseCode,
      courseName
    });

  } catch (error) {
    res.status(500).json({ message: "Decoding failed" });
  }
};

  /**
   * UPDATE COURSE (Faculty only - can only update their own courses)
   * Re-encrypts course plan and regenerates digital signature
   */
  exports.updateCourse = async (req, res) => {
    try {
      const { courseCode, courseName, description, coursePlan } = req.body;
      const courseId = req.params.id;

      // Find the course
      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if the user is the faculty who created this course
      if (course.faculty.toString() !== req.user.userId) {
        return res.status(403).json({ message: "You can only update courses you created" });
      }

      // Encrypt course plan if provided, otherwise keep existing
      const encryptedCoursePlan = coursePlan 
        ? encrypt(coursePlan) 
        : course.encryptedCoursePlan;

      // Data to be signed
      const dataToSign = `${courseCode}|${courseName}|${description}|${encryptedCoursePlan}`;

      // Generate new digital signature
      const digitalSignature = signData(dataToSign);

      // Update course
      course.courseCode = courseCode;
      course.courseName = courseName;
      course.description = description;
      course.encryptedCoursePlan = encryptedCoursePlan;
      course.digitalSignature = digitalSignature;

      await course.save();

      res.json({
        message: "Course updated successfully with new digital signature"
      });

    } catch (error) {
      console.error("Course update error:", error);
      res.status(500).json({ message: "Course update failed" });
    }
  };

/**
 * DELETE COURSE (Faculty/Admin)
 * Faculty can delete only their own courses
 */
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Only the creator (faculty) can delete
    if (course.faculty.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only delete courses you created" });
    }

    await course.deleteOne();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Course delete error:", error);
    res.status(500).json({ message: "Course delete failed" });
  }
};


