import { NextRequest, NextResponse } from 'next/server';
import { redis, deleteUser } from '@/lib/redis';

export async function DELETE(req: NextRequest) {
  try {
    // Get request headers for authorization
    const email = req.headers.get('x-user-email');

    // Only allow admin (vallian476@gmail.com) to access this endpoint
    if (email !== 'vallian476@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get all user IDs
    const userEmails = await redis.smembers('users:all');
    
    // Delete all users except admin
    const deletePromises = userEmails
      .filter(userEmail => userEmail !== 'vallian476@gmail.com')
      .map(userEmail => deleteUser(userEmail));
    
    await Promise.all(deletePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting all users for admin:', error);
    return NextResponse.json(
      { error: 'Failed to delete all users' },
      { status: 500 }
    );
  }
} 