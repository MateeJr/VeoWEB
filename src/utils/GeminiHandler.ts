import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { MessageHistory } from './HistoryManager';

// Initialize the Google GenAI client
const API_KEY = "AIzaSyAr_OgUXQQVoR1I9kXRRiw21KbsuoEdwRg";
const MODEL = "gemini-2.5-flash-preview-04-17";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(API_KEY);

// Configure safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
];

// Process a message with Gemini
export async function processWithGemini(message: string): Promise<string> {
  try {
    console.log('Processing with Gemini without history');
    
    // Get the model
    const model = genAI.getGenerativeModel({
      model: MODEL,
      safetySettings
    });
    
    // Format message with the expected structure
    const contents = [{
      role: 'user',
      parts: [{ text: message }]
    }];
    
    // Send message to Gemini
    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 1.0,
        topP: 0.95,
        maxOutputTokens: 8192
      }
    });
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
}

// Process a message with conversation history
export async function processWithHistory(message: string, history: MessageHistory[]): Promise<string> {
  try {
    if (!history || history.length === 0) {
      console.log('No history provided, falling back to processWithGemini');
      return processWithGemini(message);
    }

    // Sort history by timestamp to ensure proper order
    const sortedMessages = [...history].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    console.log(`Processing message with ${sortedMessages.length} previous messages for context`);
    
    // Get the model
    const model = genAI.getGenerativeModel({
      model: MODEL,
      safetySettings
    });
    
    // Format contents array for chat history with proper Gemini API format
    const contents: Array<{role: 'user' | 'model', parts: Array<{text: string}>}> = [];
    
    // Add messages from history with proper roles for Gemini API
    for (const msg of sortedMessages) {
      // Ensure we have valid role and content
      if (msg.role !== 'user' && msg.role !== 'model') {
        console.warn(`Invalid role found in history: ${msg.role}, skipping message`);
        continue;
      }
      
      if (!msg.content || typeof msg.content !== 'string') {
        console.warn('Invalid or empty content in message history, skipping message');
        continue;
      }
      
      contents.push({
        role: msg.role,
        parts: [{ text: msg.content }]
      });
    }
    
    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });
    
    // Debug log to see what we're sending
    console.log(`Sending conversation with ${contents.length} messages to Gemini`);
    console.log('Sample of conversation format:', JSON.stringify(contents.slice(-3)));
    
    // Send to Gemini API
    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 1.0,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    });
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in processWithHistory:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Try one more time with just the message if we get an error with history
    try {
      console.log('Retrying without history due to error...');
      return await processWithGemini(message);
    } catch (retryError) {
      console.error('Retry also failed:', retryError);
      return 'Sorry, I encountered an error while processing your request. Please try again.';
    }
  }
}

export default {
  processWithGemini,
  processWithHistory
}; 