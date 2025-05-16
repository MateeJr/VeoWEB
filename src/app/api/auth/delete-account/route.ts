import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { User } from '@/utils/auth'; // Assuming User type is available

const usersFilePath = path.join(process.cwd(), 'users.json');

async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If users.json doesn't exist, return empty array
      return [];
    }
    console.error('Failed to read user data:', error);
    throw new Error('Could not read user data');
  }
}

async function saveUsers(users: User[]): Promise<void> {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw new Error('Could not save user data');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const user = users[userIndex];

    // WARNING: Plain text password comparison. In a real app, use hashed passwords and a secure comparison.
    if (user.password !== password) {
      return NextResponse.json({ success: false, message: 'Incorrect password' }, { status: 401 });
    }

    // Remove user from the array
    users.splice(userIndex, 1);
    await saveUsers(users);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });

  } catch (error) {
    console.error('[DELETE_ACCOUNT_POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error during account deletion.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 