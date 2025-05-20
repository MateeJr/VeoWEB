import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/utils/auth';
import { saveUser, getUserByEmail } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { email, password, username, deviceFingerprint } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json({ success: false, message: 'Email, password, and username are required' }, { status: 400 });
    }

    // Basic validation (add more as needed)
    if (password.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (username.length < 3) {
        return NextResponse.json({ success: false, message: 'Username must be at least 3 characters' }, { status: 400 });
    }

    // Check if user already exists in Redis
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json({ success: false, message: 'User already exists with this email' }, { status: 409 });
    }
    
    // In a real app, hash the password before saving
    // For simplicity, storing plain text here, similar to the reference account.json
    const newUser: User = {
      email,
      password, // Store plain for this example, HASH IN PRODUCTION!
      username,
      deviceFingerprint: deviceFingerprint || '',
      createdAt: Date.now(),
      allowLogging: false,  // Default: Logging OFF
      allowTelemetry: true, // Default: Telemetry ON
    };

    // Save user to Redis
    await saveUser(newUser);

    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully',
      username: username // Include username in response for auto-login
    });

  } catch (error) {
    console.error('[REGISTER_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 