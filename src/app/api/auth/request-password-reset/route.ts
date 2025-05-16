import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { User } from '@/utils/auth';
// import crypto from 'crypto'; // For more secure OTP generation if needed

const usersFilePath = path.join(process.cwd(), 'users.json');

async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw new Error('Could not read user data');
  }
}

async function saveUsers(users: User[]): Promise<void> {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    throw new Error('Could not save user data');
  }
}

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

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
      // Even if user not found, return a generic message to prevent email enumeration
      console.warn(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({ success: true, message: 'If your email is in our system, you will receive a password reset link.' });
    }

    const otp = generateOtp();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

    users[userIndex].passwordResetOTP = { code: otp, expiresAt: otpExpiry };
    await saveUsers(users);

    // In a real app, send the OTP via email
    console.log(`Password Reset OTP for ${email}: ${otp}`); // Log OTP for testing
    // await sendPasswordResetEmail(email, otp); // Implement this function using an email service

    return NextResponse.json({ success: true, message: 'Password reset OTP sent (check console for testing).' });

  } catch (error) {
    console.error('[REQUEST_PASSWORD_RESET_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 