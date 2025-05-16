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
    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Email, current password, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // In a real app, compare hashed passwords
    if (users[userIndex].password !== currentPassword) {
      return NextResponse.json({ success: false, message: 'Incorrect current password' }, { status: 401 });
    }

    // In a real app, hash the newPassword before saving
    users[userIndex].password = newPassword; // Store plain for this example, HASH IN PRODUCTION!
    await saveUsers(users);

    return NextResponse.json({ success: true, message: 'Password changed successfully' });

  } catch (error) {
    console.error('[CHANGE_PASSWORD_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 