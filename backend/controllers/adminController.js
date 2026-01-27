const { generateInviteToken } = require("../utils/inviteTokenUtil");

exports.createInvite = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Only allow student and faculty roles - admin must be registered directly in DB
    if (!["student", "faculty"].includes(role)) {
      return res.status(400).json({ 
        message: "Invalid role. Only 'student' and 'faculty' roles can be invited. Admin users must be registered directly in the database." 
      });
    }

    const token = generateInviteToken(email, role);

    res.json({
      message: "Invite token generated",
      inviteToken: token,
      role: role
    });
  } catch (error) {
    console.error("Create invite error:", error);
    res.status(500).json({ 
      message: "Failed to generate invite token",
      error: error.message 
    });
  }
};

