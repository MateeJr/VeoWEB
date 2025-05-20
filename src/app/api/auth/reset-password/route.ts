import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/utils/auth';
import { getUserByEmail, updateUser } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, message: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const user = await getUserByEmail(email) as unknown as User;

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid OTP or email' }, { status: 400 });
    }

    if (!user.passwordResetOTP || user.passwordResetOTP.code !== otp) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
    }

    if (Date.now() > user.passwordResetOTP.expiresAt) {
      // Clear expired OTP
      await updateUser(email, { passwordResetOTP: null });
      return NextResponse.json({ success: false, message: 'OTP has expired' }, { status: 400 });
    }

    // In a real app, hash the newPassword before saving
    // Update password and clear OTP
    await updateUser(email, { 
      password: newPassword, // Store plain for this example, HASH IN PRODUCTION!
      passwordResetOTP: null // Clear OTP after successful reset
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('[RESET_PASSWORD_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 