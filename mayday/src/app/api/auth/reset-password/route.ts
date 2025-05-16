import { NextResponse } from 'next/server';
import { getAccounts, saveAccounts } from '@/utils/server-auth';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, otp, newPassword } = body;

    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email?.toLowerCase();

    console.log('Password reset verification:', { email: normalizedEmail, otpProvided: !!otp });

    // Basic validation
    if (!normalizedEmail || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Email, verification code, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get accounts
    const accounts = getAccounts();

    // Find the account (case-insensitive comparison)
    const accountIndex = accounts.findIndex(acc => acc.email.toLowerCase() === normalizedEmail);
    if (accountIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    const account = accounts[accountIndex];
    
    // Verify OTP exists and is not expired
    if (!account.passwordResetOTP || 
        account.passwordResetOTP.code !== otp || 
        account.passwordResetOTP.expiresAt < Date.now()) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Update password and remove OTP
    account.password = newPassword;
    account.passwordResetOTP = undefined;
    saveAccounts(accounts);

    return NextResponse.json(
      { success: true, message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: 'Password reset failed. Please try again later.' },
      { status: 500 }
    );
  }
} 