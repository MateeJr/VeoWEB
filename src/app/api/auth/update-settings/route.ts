import { NextResponse } from 'next/server';
import { getUserByEmail, updateUser } from '@/lib/redis';

// Handler for POST requests to update user settings
export async function POST(request: Request) {
  try {
    const { email, allowLogging, allowTelemetry } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Prepare updates
    const updates: Record<string, any> = {};
    if (allowLogging !== undefined) {
      updates.allowLogging = allowLogging;
    }
    if (allowTelemetry !== undefined) {
      updates.allowTelemetry = allowTelemetry;
    }

    // Update user in Redis
    await updateUser(email, updates);

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 