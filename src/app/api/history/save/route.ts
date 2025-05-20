import { NextRequest, NextResponse } from 'next/server';
import { ConversationHistory } from '@/utils/HistoryManager';
import { saveConversationToRedis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, conversation } = body;
    
    if (!userId || !conversation) {
      return NextResponse.json({ error: 'User ID and conversation data are required' }, { status: 400 });
    }
    
    // Ensure the conversation has required fields
    if (!conversation.id || !conversation.messages || !Array.isArray(conversation.messages)) {
      return NextResponse.json({ error: 'Invalid conversation format' }, { status: 400 });
    }
    
    // Make sure timestamps exist
    if (!conversation.createdAt) {
      conversation.createdAt = new Date().toISOString();
    }
    conversation.updatedAt = new Date().toISOString();
    
    // Save to Redis
    const success = await saveConversationToRedis(userId, conversation as ConversationHistory);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to save conversation to Redis' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving conversation:', error);
    return NextResponse.json(
      { error: 'Failed to save conversation' },
      { status: 500 }
    );
  }
} 