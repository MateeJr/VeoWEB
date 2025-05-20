import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/utils/auth';
import { getUserByEmail, updateUser } from '@/lib/redis';
import { sendPasswordResetOTP } from '@/utils/emailService';
// import crypto from 'crypto'; // For more secure OTP generation if needed

function generateOtp(length: number = 6): string {
  // Simple numeric OTP
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
  // For a more secure OTP, consider using crypto:
  // return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      // Even if user not found, return a generic message to prevent email enumeration
      console.warn(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({ success: true, message: 'If your email is in our system, you will receive a password reset link.' });
    }

    const otp = generateOtp();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

    // Update user with OTP in Redis
    await updateUser(email, { 
      passwordResetOTP: { 
        code: otp, 
        expiresAt: otpExpiry 
      }
    });

    // In a real app, send the OTP via email
    // console.log(`Password Reset OTP for ${email}: ${otp}`); // Log OTP for testing
    const emailSent = await sendPasswordResetOTP(email, otp); // Use the email service

    if (!emailSent) {
      // Log the error but still return a generic success message to the client
      // to avoid leaking information about email sending status for a specific user.
      console.error(`Failed to send password reset OTP to ${email}, but returning generic success message.`);
      // Optionally, you might want to alert admins here or have more robust error handling/retry mechanisms.
      // For the client, we still pretend it might have been sent to avoid enumeration attacks.
      return NextResponse.json({ success: true, message: 'If your email is in our system, you will receive a password reset link.' });
    }

    return NextResponse.json({ success: true, message: 'Password reset OTP sent. Please check your email.' }); // Updated message

  } catch (error) {
    console.error('[REQUEST_PASSWORD_RESET_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 