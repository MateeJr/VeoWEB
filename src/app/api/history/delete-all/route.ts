import { NextRequest, NextResponse } from 'next/server';
import { deleteAllConversationsForUser } from '@/utils/ServerFileUtils';

export async function DELETE(req: NextRequest) {
  try {
    // Get parameters from the request body
    const body = await req.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const success = deleteAllConversationsForUser(userId);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete all conversations' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting all conversations:', error);
    return NextResponse.json(
      { error: 'Failed to delete all conversations' },
      { status: 500 }
    );
  }
} 