import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/utils/auth';
import { getUserByEmail, updateUser } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { email, password, deviceFingerprint } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // Require deviceFingerprint for login
    if (!deviceFingerprint) {
      return NextResponse.json({ success: false, message: 'Device information is required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    // In a real app, compare hashed passwords
    if (user.password !== password) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    // Always update the device fingerprint on successful login
    await updateUser(email, { deviceFingerprint });

    // Return minimal user info, password should not be sent back
    return NextResponse.json({ 
        success: true, 
        message: 'Login successful', 
        username: user.username 
    });

  } catch (error) {
    console.error('[LOGIN_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 