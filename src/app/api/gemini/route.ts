import { NextRequest, NextResponse } from 'next/server';
import { processWithGemini, processWithHistory } from '@/utils/GeminiHandler';
import { loadConversationFromFile } from '@/utils/ServerFileUtils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userId, conversationId } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required - please provide your account ID' }, { status: 400 });
    }
    
    console.log(`Processing message with userId: ${userId}, conversationId: ${conversationId || 'none'}`);
    
    let response;
    
    // Check if we have a conversation history to use
    if (conversationId) {
      // Load conversation history from disk
      console.log(`Loading conversation history: ${userId}/${conversationId}`);
      const conversation = loadConversationFromFile(userId, conversationId);
      
      if (conversation && conversation.messages && conversation.messages.length > 0) {
        // Use the conversation history for context
        console.log(`Found conversation with ${conversation.messages.length} messages, using history`);
        response = await processWithHistory(message, conversation.messages);
      } else {
        // Fallback to regular processing if history not found
        console.log('No valid conversation history found, processing without history');
        response = await processWithGemini(message);
      }
    } else {
      // No history, process normally
      console.log('No conversationId provided, processing without history');
      response = await processWithGemini(message);
    }
    
    return NextResponse.json({ response });
    } catch (error) {    console.error('Error in Gemini API route:', error);    return NextResponse.json(      { error: 'Failed to process your request' },      { status: 500 }    );  }
} 