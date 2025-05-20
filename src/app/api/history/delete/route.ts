import { NextRequest, NextResponse } from 'next/server';
import { deleteConversationFromRedis } from '@/lib/redis';

export async function DELETE(req: NextRequest) {
  try {
    // Get parameters from the request body
    const body = await req.json();
    const { userId, conversationId } = body;
    
    if (!userId || !conversationId) {
      return NextResponse.json({ error: 'User ID and conversation ID are required' }, { status: 400 });
    }
    
    const success = await deleteConversationFromRedis(userId, conversationId);
    
    if (!success) {
      return NextResponse.json({ error: 'Conversation not found or could not be deleted' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
} 