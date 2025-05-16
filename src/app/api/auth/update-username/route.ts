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

export async function POST(req: NextRequest) {
  try {
    const { email, username } = await req.json();

    if (!email || !username) {
      return NextResponse.json({ success: false, message: 'Email and username are required' }, { status: 400 });
    }
    if (username.length < 3 || username.length > 16) {
        return NextResponse.json({ success: false, message: 'Username must be between 3 and 16 characters'}, {status: 400});
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    users[userIndex].username = username;
    await saveUsers(users);

    return NextResponse.json({ success: true, message: 'Username updated successfully' });

  } catch (error) {
    console.error('[UPDATE_USERNAME_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 