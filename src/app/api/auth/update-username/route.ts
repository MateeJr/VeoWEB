import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/utils/auth';
import { getUserByEmail, updateUser } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { email, username } = await req.json();

    if (!email || !username) {
      return NextResponse.json({ success: false, message: 'Email and username are required' }, { status: 400 });
    }
    if (username.length < 3 || username.length > 16) {
        return NextResponse.json({ success: false, message: 'Username must be between 3 and 16 characters'}, {status: 400});
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    await updateUser(email, { username });

    return NextResponse.json({ success: true, message: 'Username updated successfully' });

  } catch (error) {
    console.error('[UPDATE_USERNAME_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 