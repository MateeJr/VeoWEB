import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

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

    // Get all user IDs
    const userIds = await redis.smembers('users:all');
    
    // Collect all conversations for all users
    const allConversations = [];
    
    for (const userId of userIds) {
      // Get conversation IDs for this user
      const conversationIds = await redis.smembers(`user:${userId}:conversations`);
      
      // Get each conversation details
      for (const convId of conversationIds) {
        const conversationData = await redis.hgetall(`conversation:${userId}:${convId}`);
        
        if (conversationData && Object.keys(conversationData).length > 0) {
          // Calculate message count if messages exist
          let messageCount = 0;
          if (conversationData.messages) {
            try {
              const messages = typeof conversationData.messages === 'string' 
                ? JSON.parse(conversationData.messages) 
                : conversationData.messages;
              
              messageCount = Array.isArray(messages) ? messages.length : 0;
            } catch (err) {
              console.error('Error parsing messages:', err);
            }
          }
          
          allConversations.push({
            id: conversationData.id || convId,
            title: conversationData.title || 'Untitled',
            userId: userId,
            createdAt: conversationData.createdAt || new Date().toISOString(),
            updatedAt: conversationData.updatedAt || new Date().toISOString(),
            messageCount
          });
        }
      }
    }
    
    // Sort by updatedAt (newest first)
    allConversations.sort((a, b) => {
      const dateA = new Date(String(a.updatedAt)).getTime();
      const dateB = new Date(String(b.updatedAt)).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ conversations: allConversations });
  } catch (error) {
    console.error('Error fetching conversations for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
} 