const jwt = require("jsonwebtoken");

const INVITE_SECRET = process.env.INVITE_SECRET;

if (!INVITE_SECRET) {
  console.error("❌ INVITE_SECRET is not defined in environment variables");
  throw new Error("INVITE_SECRET environment variable is required");
}

// Generate invitation token (ADMIN only)
exports.generateInviteToken = (email, role) => {
  if (!email || !role) {
    throw new Error("Email and role are required");
  }
  
  return jwt.sign(
    {
      email,
      role
    },
    INVITE_SECRET,
    { expiresIn: "24h" }
  );
};

// Verify invitation token
exports.verifyInviteToken = (token) => {
  if (!token) {
    throw new Error("Token is required");
  }
  
  return jwt.verify(token, INVITE_SECRET);
};
