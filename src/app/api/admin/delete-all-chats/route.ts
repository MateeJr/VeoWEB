import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

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
    const userIds = await redis.smembers('users:all');
    
    // For each user, delete all their conversations
    for (const userId of userIds) {
      // Get all conversation IDs for this user
      const conversationIds = await redis.smembers(`user:${userId}:conversations`);
      
      // Delete each conversation
      for (const convId of conversationIds) {
        await redis.del(`conversation:${userId}:${convId}`);
      }
      
      // Clear the user's conversation set
      await redis.del(`user:${userId}:conversations`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting all chats for admin:', error);
    return NextResponse.json(
      { error: 'Failed to delete all chats' },
      { status: 500 }
    );
  }
} 