/**
 * @file        emailService.ts
 * @owner       IT Team
 * @description Email delivery service supporting Nodemailer SMTP and local development fallback.
 */

import nodemailer from 'nodemailer';

// Helper to get transporter instance dynamically per call
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '2525', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass && user !== 'your_smtp_user' && pass !== 'your_smtp_password') {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 2525 / 587
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false, // Avoids self-signed dev certificate failures
      },
    });
  }
  return null;
};

export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const verifyUrl = `${backendUrl}/api/auth/verify-email/${token}`;

  console.log(`\n==================================================`);
  console.log(` 📧 EMAIL VERIFICATION LINK FOR: ${email}`);
  console.log(` 🔗 Click to verify: ${verifyUrl}`);
  console.log(`==================================================\n`);

  const transporter = getTransporter();
  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || '"Innovation Hub" <no-reply@innovationhub.com>';
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Verify your Innovation Hub Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4F46E5;">Welcome to Innovation Hub!</h2>
            <p>Thank you for signing up. Please click the button below to verify your email address and activate your account:</p>
            <div style="margin: 25px 0;">
              <a href="${verifyUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">Or copy and paste this link in your browser:</p>
            <p style="color: #64748b; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
          </div>
        `,
      });
      console.log(`[EmailService] Verification email sent to ${email} via SMTP.`);
      return true;
    } catch (err) {
      console.error(`[EmailService] Failed to send SMTP email to ${email}:`, err);
      return false;
    }
  }
  return true;
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<boolean> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  console.log(`\n==================================================`);
  console.log(` 🔐 PASSWORD RESET LINK FOR: ${email}`);
  console.log(` 🔗 Click to reset: ${resetUrl}`);
  console.log(`==================================================\n`);

  const transporter = getTransporter();
  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || '"Innovation Hub" <no-reply@innovationhub.com>';
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Reset your Innovation Hub Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4F46E5;">Password Reset Request</h2>
            <p>You requested a password reset for your Innovation Hub account. Click the button below to set a new password:</p>
            <div style="margin: 25px 0;">
              <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">If you did not request this, please ignore this email.</p>
            <p style="color: #64748b; font-size: 14px; word-break: break-all;">${resetUrl}</p>
          </div>
        `,
      });
      console.log(`[EmailService] Reset email sent to ${email} via SMTP.`);
      return true;
    } catch (err) {
      console.error(`[EmailService] Failed to send SMTP email to ${email}:`, err);
      return false;
    }
  }
  return true;
};
