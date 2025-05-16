import { NextResponse } from 'next/server';
import { getAccounts, saveAccounts } from '@/utils/server-auth';
import { sendPasswordResetOTP } from '@/utils/emailService';

// Generate a random 6-digit OTP code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email } = body;

    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email?.toLowerCase();

    console.log('Password reset request:', { email: normalizedEmail });

    // Basic validation
    if (!normalizedEmail) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Get accounts
    const accounts = getAccounts();

    // Find the account (case-insensitive comparison)
    const accountIndex = accounts.findIndex(acc => acc.email.toLowerCase() === normalizedEmail);
    if (accountIndex === -1) {
      // Account doesn't exist, return an error
      return NextResponse.json(
        { success: false, message: 'No account found with this email address' },
        { status: 400 }
      );
    }

    // Generate OTP and set expiration (15 minutes from now)
    const otp = generateOTP();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save OTP to account
    accounts[accountIndex].passwordResetOTP = {
      code: otp,
      expiresAt
    };
    saveAccounts(accounts);

    // Send OTP via email
    const emailSent = await sendPasswordResetOTP(accounts[accountIndex].email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, message: 'Failed to send reset code. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Verification code has been sent to your email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { success: false, message: 'Password reset request failed. Please try again later.' },
      { status: 500 }
    );
  }
} 