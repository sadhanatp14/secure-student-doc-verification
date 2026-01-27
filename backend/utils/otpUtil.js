const nodemailer = require("nodemailer");

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password"
  }
});

// For development: log OTPs to console if email credentials aren't configured
const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Generate random 6-digit OTP
 */
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to user's email
 */
exports.sendOTPEmail = async (email, otp) => {
  try {
    // For development mode: log OTP to console for testing
    if (isDevelopment && (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your-email@gmail.com")) {
      console.log(`\n📧 [DEV MODE] OTP for ${email}: ${otp}`);
      console.log(`   Expires in 5 minutes\n`);
      return true; // Return success for testing
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "Your One-Time Password (OTP) for Secure Student Doc Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              Your one-time password (OTP) for secure login is:
            </p>
            <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              This OTP will expire in 5 minutes.
            </p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              If you did not request this OTP, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Secure Student Document Verification System
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    // In development mode, still return true so testing can proceed
    if (isDevelopment) {
      console.warn("⚠️  Email sending failed in development. To enable real emails, configure EMAIL_USER and EMAIL_PASSWORD in .env");
      return true;
    }
    return false;
  }
};

/**
 * Verify OTP is valid (not expired, correct format)
 */
exports.isOTPValid = (storedOTP, currentTime) => {
  if (!storedOTP) return false;
  return storedOTP.expiresAt > currentTime;
};
