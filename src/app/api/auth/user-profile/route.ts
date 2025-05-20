import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/utils/auth';
import { getUserByEmail } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Return user data, excluding password
    const userData = user as unknown as User;
    const { password, ...userProfile } = userData;
    return NextResponse.json({ success: true, user: userProfile });

  } catch (error) {
    console.error('[USER_PROFILE_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 