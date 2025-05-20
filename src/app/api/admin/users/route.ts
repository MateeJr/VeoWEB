import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    // Get request headers for authorization
    const authHeader = req.headers.get('authorization');
    const email = req.headers.get('x-user-email');

    // Only allow admin (vallian476@gmail.com) to access this endpoint
    if (email !== 'vallian476@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get all users from Redis
    const users = await getAllUsers();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 