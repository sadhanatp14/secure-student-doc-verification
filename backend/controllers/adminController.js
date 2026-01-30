const { generateInviteToken } = require("../utils/inviteTokenUtil");
const nodemailer = require("nodemailer");

// Reuse the same email transport config as OTP emails
const inviteTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendInviteEmail = async ({ to, token, role }) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const registerLink = `${frontendUrl}/register?inviteToken=${encodeURIComponent(token)}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Crypt-o-Course Invitation – Complete Your Registration",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #222;">
        <h2 style="color: #0b5ed7; margin-bottom: 12px;">🔐 Crypt-o-Course Invitation</h2>
        <p style="margin: 0 0 12px; font-size: 16px;">You have been invited to join as <strong>${role}</strong></p>
        <p style="margin: 0 0 12px;">Use the invitation token below to create your account on Crypt-o-Course.</p>

        <div style="background: #0b5ed7; color: #fff; padding: 18px; border-radius: 10px; text-align: center; font-size: 18px; letter-spacing: 0.8px;">
          <strong>${token}</strong>
        </div>

        <p style="margin: 16px 0 8px;">Quick steps to register on Crypt-o-Course:</p>
        <ol style="padding-left: 18px; margin: 0 0 12px;">
          <li>Open the registration page: <a href="${registerLink}" style="color: #0b5ed7;">Register Now</a></li>
          <li>Enter your name, institutional email, and a strong password</li>
          <li>Paste the invitation token shown above into the token field</li>
          <li>Submit to complete your account creation as a ${role}</li>
        </ol>

        <p style="margin: 14px 0 4px; font-weight: 600;">Guidelines:</p>
        <ul style="padding-left: 18px; margin: 0 0 18px;">
          <li>This token is valid for 24 hours.</li>
          <li>Keep it confidential; it grants ${role} access.</li>
          <li>If you didn't expect this invite, ignore this email.</li>
        </ul>

        <p style="font-size: 12px; color: #555; margin: 0;">If the button/link doesn't work, copy and paste this URL in your browser:<br/>
        <span style="color: #0b5ed7;">${registerLink}</span></p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          Crypt-o-Course | Cryptographically Secured Course Management
        </p>
      </div>
    `
  };

  return inviteTransporter.sendMail(mailOptions);
};

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

    // Try sending the invitation email; if it fails, still return the token for manual sharing
    let emailInfo;
    try {
      emailInfo = await sendInviteEmail({ to: email, token, role });
      console.log(`📨 Invite email sent to ${email}. MessageId: ${emailInfo.messageId || "n/a"}`);
    } catch (emailError) {
      console.error("Invite email send error:", emailError);
      return res.status(500).json({
        message: "Invite token generated but email failed to send. Please share the token manually.",
        inviteToken: token,
        role: role,
        emailSent: false
      });
    }

    res.json({
      message: "Invite token generated and emailed",
      inviteToken: token,
      role: role,
      emailSent: true,
      emailMessageId: emailInfo?.messageId || null
    });
  } catch (error) {
    console.error("Create invite error:", error);
    res.status(500).json({ 
      message: "Failed to generate invite token",
      error: error.message 
    });
  }
};

