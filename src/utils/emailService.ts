import nodemailer from 'nodemailer';

// Configure nodemailer with your email service
// Note: For production, use environment variables for these values
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Sends an OTP to the user's email for password reset
 */
export const sendPasswordResetOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '\"VNYL Support\" <support@vnyl.app>',
      to: email,
      subject: 'Your Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Password Reset Code</h2>
          <p>You requested a password reset for your VNYL account. Use the code below to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="font-size: 32px; margin: 0; color: #000;">${otp}</h1>
          </div>
          <p>This code will expire in 15 minutes. If you didn\'t request a password reset, please ignore this email or contact support.</p>
          <p style="font-size: 12px; color: #666; margin-top: 30px; text-align: center;">
            &copy; ${new Date().getFullYear()} VNYL. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}; 