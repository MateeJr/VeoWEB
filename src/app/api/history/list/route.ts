import { NextRequest, NextResponse } from 'next/server';
import { listUserConversationsFromRedis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    // Get userId from query parameter
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const conversations = await listUserConversationsFromRedis(userId);
    
    // Return only essential data to keep response size manageable
    const simplifiedConversations = conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      // Count only user messages
      messageCount: conv.messages.filter(msg => msg.role === 'user').length
    }));
    
    return NextResponse.json({ conversations: simplifiedConversations });
  } catch (error) {
    console.error('Error listing conversations:', error);
    return NextResponse.json(
      { error: 'Failed to list conversations' },
      { status: 500 }
    );
  }
} 