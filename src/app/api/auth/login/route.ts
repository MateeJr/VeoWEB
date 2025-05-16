import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { User } from '@/utils/auth';

const usersFilePath = path.join(process.cwd(), 'users.json');

async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    console.error("Error reading users file:", error);
    throw new Error('Could not read user data');
  }
}

async function saveUsers(users: User[]): Promise<void> {
    try {
      await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    } catch (error) {
      console.error("Error writing users file:", error);
      throw new Error('Could not save user data');
    }
  }

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

    const users = await getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    // In a real app, compare hashed passwords
    if (user.password !== password) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    // Always update the device fingerprint on successful login
    user.deviceFingerprint = deviceFingerprint;
    await saveUsers(users);

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