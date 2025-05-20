import { NextRequest, NextResponse } from 'next/server';
import { loadConversationFromRedis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    // Get parameters from query string
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const conversationId = url.searchParams.get('conversationId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }
    
    const conversation = await loadConversationFromRedis(userId, conversationId);
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error loading conversation:', error);
    return NextResponse.json(
      { error: 'Failed to load conversation' },
      { status: 500 }
    );
  }
} 