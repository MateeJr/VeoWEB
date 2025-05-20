import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/utils/auth';
import { getUserByEmail, deleteUser } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // WARNING: Plain text password comparison. In a real app, use hashed passwords and a secure comparison.
    if (user.password !== password) {
      return NextResponse.json({ success: false, message: 'Incorrect password' }, { status: 401 });
    }

    // Delete user from Redis
    await deleteUser(email);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });

  } catch (error) {
    console.error('[DELETE_ACCOUNT_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error during account deletion.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 