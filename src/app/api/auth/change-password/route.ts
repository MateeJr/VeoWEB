import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/utils/auth';
import { getUserByEmail, updateUser } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Email, current password, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // In a real app, compare hashed passwords
    if (user.password !== currentPassword) {
      return NextResponse.json({ success: false, message: 'Incorrect current password' }, { status: 401 });
    }

    // In a real app, hash the newPassword before saving
    await updateUser(email, { password: newPassword }); // Store plain for this example, HASH IN PRODUCTION!

    return NextResponse.json({ success: true, message: 'Password changed successfully' });

  } catch (error) {
    console.error('[CHANGE_PASSWORD_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 