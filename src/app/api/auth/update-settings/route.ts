import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { User } from '@/utils/auth';

// This would be replaced with a proper database in a production environment
const USERS_FILE_PATH = path.join(process.cwd(), 'users.json');

// Handler for POST requests to update user settings
export async function POST(request: Request) {
  try {
    const { email, allowLogging, allowTelemetry } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // Read the users file
    const usersData = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    const users: User[] = JSON.parse(usersData);

    // Find the user by email
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex === -1) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Update the user settings
    if (allowLogging !== undefined) {
      users[userIndex].allowLogging = allowLogging;
    }
    if (allowTelemetry !== undefined) {
      users[userIndex].allowTelemetry = allowTelemetry;
    }

    // Save the updated users data
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 