import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { MessageHistory } from './HistoryManager';

// Initialize the Google GenAI client
const API_KEY = "AIzaSyAr_OgUXQQVoR1I9kXRRiw21KbsuoEdwRg";
const MODEL = "gemini-2.5-flash-preview-05-20";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(API_KEY);

// Configure safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE }
];

// Cache for system instructions
let systemInstructionsCache: string | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

// Function to get system instructions from the API endpoint
const getSystemInstructions = async (): Promise<string | null> => {
  const now = Date.now();
  
  // Return cached value if it's still fresh
  if (systemInstructionsCache !== null && now - lastFetchTime < CACHE_DURATION) {
    return systemInstructionsCache;
  }
  
  try {
    // Call the API endpoint to get system instructions from system.txt
    const response = await fetch('/api/system-prompt', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch system instructions:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    let promptText = data.prompt;
    
    // If we have a prompt, prepend the current date and time
    if (promptText) {
      const currentDate = new Date();
      const dateTimeString = `Current date: ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
      
      // Add the date/time at the beginning of the prompt
      promptText = promptText.replace(/Current date:.*?\n/m, ''); // Remove any existing date line
      promptText = `${dateTimeString}\n\n${promptText}`;
      
      console.log('Loaded system instructions from system.txt with current date/time');
    } else {
      console.log('No system instructions found, operating without system prompt');
    }
    
    systemInstructionsCache = promptText;
    lastFetchTime = now;
    
    return systemInstructionsCache;
  } catch (error) {
    console.error('Error fetching system instructions:', error);
    return null;
  }
};

// Helper function to convert base64 image data into Gemini compatible format
const prepareImagePart = (imageData: string) => {
  // Check if the data already has a data URL prefix
  if (imageData.startsWith('data:')) {
    // Extract the base64 content
    const base64Content = imageData.split(',')[1];
    if (!base64Content) {
      console.error('Invalid image data format');
      return null;
    }
    return {
      inlineData: {
        data: base64Content,
        mimeType: imageData.split(';')[0].split(':')[1]
      }
    };
  } else {
    // Assume it's already base64
    return {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg' // Default mime type if unknown
      }
    };
  }
};

// Process a message with Gemini
export async function processWithGemini(
  message: string, 
  thinkingBudget: number = 8192, 
  images?: { data: string; type: string; name: string }[]
): Promise<string> {
  try {
    console.log('Processing with Gemini without history');
    
    // Create model options
    const modelOptions: any = {
      model: MODEL,
      safetySettings
    };
    
    // Add system instruction if available
    const systemInstructions = await getSystemInstructions();
    if (systemInstructions) {
      // Add search status to system instructions - default to OFF for direct calls
      let promptWithSearchStatus = systemInstructions;
      promptWithSearchStatus += "\n\nSEARCH FEATURE = OFF\nSEARCH FEATURE IS DISABLED, IF THIS NEEDED, ASK USER TO TURN ON THE SEARCH FEATURE";
      
      modelOptions.systemInstruction = { text: promptWithSearchStatus };
    }
    
    // Get the model
    const model = genAI.getGenerativeModel(modelOptions);
    
    // Prepare the parts array, which can include text and/or images
    const parts: any[] = [];
    
    // Add images first if available
    if (images && images.length > 0) {
      console.log(`Adding ${images.length} images to the message`);
      for (const image of images) {
        const imagePart = prepareImagePart(image.data);
        if (imagePart) {
          parts.push(imagePart);
        }
      }
    }
    
    // Add the text message
    if (message && message.trim() !== '') {
      parts.push({ text: message });
    }
    
    // Format message with the expected structure
    const contents = [{
      role: 'user',
      parts
    }];
    
    // Create generation config with thinking budget
    const generationConfig = {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: 8192,
      thinkingConfig: {
        thinkingBudget: thinkingBudget
      }
    };
    
    // Send message to Gemini
    const result = await model.generateContent({
      contents,
      generationConfig
    });
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
}

// Process a message with Gemini (streaming version)
export async function processWithGeminiStream(
  message: string, 
  onChunk: (chunk: string) => void,
  thinkingBudget: number = 8192,
  images?: { data: string; type: string; name: string }[]
): Promise<string> {
  try {
    console.log('Processing with Gemini (streaming) without history');
    
    // Create model options
    const modelOptions: any = {
      model: MODEL,
      safetySettings
    };
    
    // Add system instruction if available
    const systemInstructions = await getSystemInstructions();
    if (systemInstructions) {
      // Add search status to system instructions - default to OFF for streaming version
      let promptWithSearchStatus = systemInstructions;
      promptWithSearchStatus += "\n\nSEARCH FEATURE = OFF\nSEARCH FEATURE IS DISABLED, IF THIS NEEDED, ASK USER TO TURN ON THE SEARCH FEATURE";
      
      modelOptions.systemInstruction = { text: promptWithSearchStatus };
    }
    
    // Get the model
    const model = genAI.getGenerativeModel(modelOptions);
    
    // Prepare the parts array, which can include text and/or images
    const parts: any[] = [];
    
    // Add images first if available
    if (images && images.length > 0) {
      console.log(`Adding ${images.length} images to the message (streaming)`);
      for (const image of images) {
        const imagePart = prepareImagePart(image.data);
        if (imagePart) {
          parts.push(imagePart);
        }
      }
    }
    
    // Add the text message
    if (message && message.trim() !== '') {
      parts.push({ text: message });
    }
    
    // Format message with the expected structure
    const contents = [{
      role: 'user',
      parts
    }];
    
    // Create generation config with thinking budget
    const generationConfig = {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: 8192,
      thinkingConfig: {
        thinkingBudget: thinkingBudget,
        includeThoughts: true
      }
    };
    
    // Send message to Gemini using stream
    const result = await model.generateContentStream({
      contents,
      generationConfig
    });
    
    // Process the stream and separate thought summaries
    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkAny: any = chunk as any;
      const parts = chunkAny?.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (!part.text) continue;
        if ((part as any).thought) {
          onChunk(`__THOUGHT__${part.text}`);
        } else {
          onChunk(part.text);
          fullResponse += part.text;
        }
      }
    }
    
    return fullResponse;
  } catch (error) {
    console.error('Error communicating with Gemini stream:', error);
    const errorMessage = 'Sorry, I encountered an error while processing your request.';
    onChunk(errorMessage);
    return errorMessage;
  }
}

// Process a message with conversation history
export async function processWithHistory(
  message: string, 
  history: MessageHistory[],
  thinkingBudget: number = 8192,
  images?: { data: string; type: string; name: string }[]
): Promise<string> {
  try {
    if (!history || history.length === 0) {
      console.log('No history provided, falling back to processWithGemini');
      return processWithGemini(message, thinkingBudget, images);
    }

    // Sort history by timestamp to ensure proper order
    const sortedMessages = [...history].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    console.log(`Processing message with ${sortedMessages.length} previous messages for context`);
    
    // Create model options
    const modelOptions: any = {
      model: MODEL,
      safetySettings
    };
    
    // Add system instruction if available
    const systemInstructions = await getSystemInstructions();
    if (systemInstructions) {
      // Add search status to system instructions - default to OFF for non-streaming version
      let promptWithSearchStatus = systemInstructions;
      promptWithSearchStatus += "\n\nSEARCH FEATURE = OFF\nSEARCH FEATURE IS DISABLED, IF THIS NEEDED, ASK USER TO TURN ON THE SEARCH FEATURE";
      
      modelOptions.systemInstruction = { text: promptWithSearchStatus };
    }
    
    // Get the model
    const model = genAI.getGenerativeModel(modelOptions);
    
    // Format contents array for chat history with proper Gemini API format
    const contents: Array<{role: 'user' | 'model', parts: Array<any>}> = [];
    
    // Add messages from history with proper roles for Gemini API
    for (const msg of sortedMessages) {
      // Ensure we have valid role and content
      if (msg.role !== 'user' && msg.role !== 'model') {
        console.warn(`Invalid role found in history: ${msg.role}, skipping message`);
        continue;
      }
      
      // Parts for this message
      const msgParts: any[] = [];
      
      // Add text content
      if (msg.content && typeof msg.content === 'string') {
        msgParts.push({ text: msg.content });
      }
      
      // Add images if this message has them
      if (msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
        for (const image of msg.images) {
          const imagePart = prepareImagePart(image.data);
          if (imagePart) {
            msgParts.push(imagePart);
          }
        }
      }
      
      // Skip empty messages
      if (msgParts.length === 0) {
        console.warn('Empty content in message history, skipping message');
        continue;
      }
      
      contents.push({
        role: msg.role,
        parts: msgParts
      });
    }
    
    // Add current user message parts
    const currentMsgParts: any[] = [];
    
    // Add images first if available
    if (images && images.length > 0) {
      console.log(`Adding ${images.length} images to the current message`);
      for (const image of images) {
        const imagePart = prepareImagePart(image.data);
        if (imagePart) {
          currentMsgParts.push(imagePart);
        }
      }
    }
    
    // Add text content
    if (message && message.trim() !== '') {
      currentMsgParts.push({ text: message });
    }
    
    // Add current message if not empty
    if (currentMsgParts.length > 0) {
      contents.push({
        role: 'user',
        parts: currentMsgParts
      });
    }
    
    // Debug log to see what we're sending
    console.log(`Sending conversation with ${contents.length} messages to Gemini`);
    console.log('Sample of conversation format:', JSON.stringify(contents.slice(-3)));
    
    // Create generation config with thinking budget
    const generationConfig = {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: 4096,
      thinkingConfig: {
        thinkingBudget: thinkingBudget
      }
    };
    
    // Send to Gemini API
    const result = await model.generateContent({
      contents,
      generationConfig
    });
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in processWithHistory:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Try one more time with just the message if we get an error with history
    try {
      console.log('Retrying without history due to error...');
      return await processWithGemini(message, thinkingBudget, images);
    } catch (retryError) {
      console.error('Retry also failed:', retryError);
      return 'Sorry, I encountered an error while processing your request. Please try again.';
    }
  }
}

// Process a message with conversation history (streaming version)
export async function processWithHistoryStream(
  message: string,
  history: MessageHistory[],
  onChunk: (chunk: string) => void,
  thinkingBudget: number = 8192,
  enableSearch: boolean = false,
  images?: { data: string; type: string; name: string }[]
): Promise<string> {
  try {
    // Prepare history – if none is provided we'll simply continue without it so that
    // the search toggle (enableSearch) is still respected for the very first user
    // message of a conversation.  In this case `history` can be null/undefined or
    // an empty array – treat both as an empty array to avoid unnecessary fallbacks
    // that previously disabled search mode.
    const safeHistory: MessageHistory[] = Array.isArray(history) ? history : [];

    // Sort history by timestamp to ensure proper order (will be a no-op for empty history)
    const sortedMessages = [...safeHistory].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log(`Processing message with ${sortedMessages.length} previous messages for context (streaming)`);

    // ----------------------------------------------
    //  From here on we will use `sortedMessages` instead of the old variable.
    // ----------------------------------------------
    
    // Create model options with googleSearch tool if search is enabled
    const modelOptions: any = {
      model: MODEL,
      safetySettings
    };
    
    // Add system instruction if available
    const systemInstructions = await getSystemInstructions();
    if (systemInstructions) {
      // Add search status to system instructions
      let promptWithSearchStatus = systemInstructions;
      if (enableSearch) {
        promptWithSearchStatus += "\n\nSEARCH FEATURE = ON";
      } else {
        promptWithSearchStatus += "\n\nSEARCH FEATURE = OFF\nSEARCH FEATURE IS DISABLED, IF THIS NEEDED, ASK USER TO TURN ON THE SEARCH FEATURE";
      }
      
      modelOptions.systemInstruction = { text: promptWithSearchStatus };
    }
    
    // Add search tool if enabled
    if (enableSearch) {
      modelOptions.tools = [{
        googleSearch: {}
      }];
      console.log("Search mode enabled, adding Google Search tool");
    }
    
    const model = genAI.getGenerativeModel(modelOptions);
    
    // Format contents array for chat history with proper Gemini API format
    const contents: Array<{role: 'user' | 'model', parts: Array<any>}> = [];
    
    // Add messages from history with proper roles for Gemini API
    for (const msg of sortedMessages) {
      // Ensure we have valid role and content
      if (msg.role !== 'user' && msg.role !== 'model') {
        console.warn(`Invalid role found in history: ${msg.role}, skipping message`);
        continue;
      }
      
      // Parts for this message
      const msgParts: any[] = [];
      
      // Add text content
      if (msg.content && typeof msg.content === 'string') {
        msgParts.push({ text: msg.content });
      }
      
      // Add images if this message has them
      if (msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
        for (const image of msg.images) {
          const imagePart = prepareImagePart(image.data);
          if (imagePart) {
            msgParts.push(imagePart);
          }
        }
      }
      
      // Skip empty messages
      if (msgParts.length === 0) {
        console.warn('Empty content in message history, skipping message');
        continue;
      }
      
      contents.push({
        role: msg.role,
        parts: msgParts
      });
    }
    
    // Add current user message parts
    const currentMsgParts: any[] = [];
    
    // Add images first if available
    if (images && images.length > 0) {
      console.log(`Adding ${images.length} images to the current message (streaming)`);
      for (const image of images) {
        const imagePart = prepareImagePart(image.data);
        if (imagePart) {
          currentMsgParts.push(imagePart);
        }
      }
    }
    
    // Add text content
    if (message && message.trim() !== '') {
      currentMsgParts.push({ text: message });
    }
    
    // Add current message if not empty
    if (currentMsgParts.length > 0) {
      contents.push({
        role: 'user',
        parts: currentMsgParts
      });
    }
    
    // Debug log to see what we're sending
    console.log(`Sending conversation with ${contents.length} messages to Gemini (streaming)`);
    if (enableSearch) {
      console.log("Search features enabled for this request");
    }
    
    // Create generation config with thinking budget
    const generationConfig: any = {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: 4096,
    };
    
    generationConfig.thinkingConfig = {
      thinkingBudget: thinkingBudget,
      includeThoughts: true
    };
    
    // Send to Gemini API with streaming
    const result = await model.generateContentStream({
      contents,
      generationConfig
    });
    
    // Process the stream and separate thought summaries
    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkAny: any = chunk as any;
      const parts = chunkAny?.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (!part.text) continue;
        if ((part as any).thought) {
          onChunk(`__THOUGHT__${part.text}`);
        } else {
          onChunk(part.text);
          fullResponse += part.text;
        }
      }
    }
    
    return fullResponse;
  } catch (error) {
    console.error('Error in processWithHistoryStream:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Try one more time with just the message if we get an error with history
    try {
      console.log('Retrying without history due to error...');
      return processWithGeminiStream(message, onChunk, thinkingBudget, images);
    } catch (retryError) {
      console.error('Retry also failed:', retryError);
      const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
      onChunk(errorMessage);
      return errorMessage;
    }
  }
}

export default {
  processWithGemini,
  processWithGeminiStream,
  processWithHistory,
  processWithHistoryStream
}; 