import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { User } from '@/utils/auth'; // Assuming User interface is exported from auth.ts

const usersFilePath = path.join(process.cwd(), 'users.json');

async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    // If file doesn't exist or other error, return empty array or handle appropriately
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
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

    const users = await getUsers();
    const existingUser = users.find(user => user.email === email);

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
    };

    users.push(newUser);
    await saveUsers(users);

    return NextResponse.json({ success: true, message: 'User registered successfully' });

  } catch (error) {
    console.error('[REGISTER_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 