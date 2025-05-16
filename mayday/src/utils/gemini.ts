import { GoogleGenerativeAI, type HarmCategory, type HarmBlockThreshold } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Check if VNYL API key is available
// Use a placeholder value for type checking, but this will be checked before use
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCMzY0tIpQIF8kI4rVChGIBpWb-6-dTTQo";

// Load system instructions from system.txt file
const getSystemInstructions = (): string => {
  try {
    // Determine file path - first try relative to current file
    let systemFilePath = path.resolve(__dirname, '../system.txt');
    
    // If file doesn't exist at that path, try relative to project root
    if (!fs.existsSync(systemFilePath)) {
      systemFilePath = path.resolve(process.cwd(), 'src/system.txt');
    }
    
    // If file exists, read and return content
    if (fs.existsSync(systemFilePath)) {
      return fs.readFileSync(systemFilePath, 'utf-8');
    } else {
      console.warn('System instructions file not found. Using default instructions.');
      return 'You are VNYL, a helpful AI assistant.';
    }
  } catch (error) {
    console.error('Error loading system instructions:', error);
    return 'You are VNYL, a helpful AI assistant.';
  }
};

// Get system instructions
const systemInstructions = getSystemInstructions();

// Create the API client only if we have a valid key
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Type for safety settings to prevent TypeScript errors
type SafetySetting = {
  category: string;
  threshold: string;
};

// Type for Google Search tool
type GoogleSearchTool = {
  googleSearch: Record<string, never>;
};

// Safety settings - set all categories to OFF (disable all safety filters)
export const safetySettings: SafetySetting[] = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "OFF",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "OFF",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "OFF",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "OFF",
  },
  {
    category: "HARM_CATEGORY_CIVIC_INTEGRITY",
    threshold: "OFF",
  },
];

// Google Search tool for grounding
const googleSearchTool: GoogleSearchTool = {
  googleSearch: {}
};

// Get the VNYL Pro model with optional Google Search Grounding
export const getGeminiModel = (searchEnabled = false) => {
  if (!genAI) {
    throw new Error("VNYL AI is not configured");
  }
  
  // Configure model options based on whether search is enabled
  const modelOptions = {
    model: "gemini-2.0-flash",
    safetySettings: safetySettings as any, // Use type assertion to avoid TypeScript errors
    systemInstruction: systemInstructions // Pass system instructions as a simple string
  };

  // Add Google Search tool only if search is enabled
  if (searchEnabled) {
    return genAI.getGenerativeModel({
      ...modelOptions,
      tools: [{
        googleSearch: {}
      }] as any // Type assertion to avoid TypeScript errors with the tools parameter
    });
  }

  // Return model without Google Search Grounding
  return genAI.getGenerativeModel(modelOptions);
};

// Check if the API key is configured
export const isGeminiConfigured = (): boolean => {
  return !!apiKey && apiKey !== "your_gemini_api_key_here";
};

// Generate a response from VNYL
export const generateResponse = async (
  prompt: string,
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[] = [],
  searchEnabled = false // Add searchEnabled parameter with default value
) => {
  try {
    if (!isGeminiConfigured()) {
      return { 
        success: false, 
        text: null, 
        error: "VNYL AI is not configured .env file." 
      };
    }
    
    // Pass searchEnabled flag to getGeminiModel
    const model = getGeminiModel(searchEnabled);
    
    // Create a chat session if there's history
    if (chatHistory.length > 0) {
      const chatOptions: any = {
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 1,
          topP: 0.95,
          topK: 64,
        },
        safetySettings: safetySettings as any, // Use type assertion to avoid TypeScript errors
      };
      
      const chat = model.startChat(chatOptions);
      
      const result = await chat.sendMessage(prompt);
      // Access the groundingMetadata if available, or return null
      let groundingMetadata = null;
      try {
        // @ts-ignore - Accessing potentially undefined property
        groundingMetadata = result.response.candidates?.[0]?.groundingMetadata || null;
      } catch (e) {
        // Silently handle if the property doesn't exist
      }
      
      return { 
        success: true, 
        text: result.response.text(), 
        error: null,
        groundingMetadata,
        searchWasEnabled: searchEnabled
      };
    } else {
      // One-time prompt without history - use proper content structure
      const contentOptions: any = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings: safetySettings as any, // Use type assertion to avoid TypeScript errors
      };
      
      const result = await model.generateContent(contentOptions);
      
      // Access the groundingMetadata if available, or return null
      let groundingMetadata = null;
      try {
        // @ts-ignore - Accessing potentially undefined property
        groundingMetadata = result.candidates?.[0]?.groundingMetadata || null;
      } catch (e) {
        // Silently handle if the property doesn't exist
      }
      
      return { 
        success: true, 
        text: result.response.text(), 
        error: null,
        groundingMetadata,
        searchWasEnabled: searchEnabled
      };
    }
  } catch (error) {
    console.error("Error generating VNYL response:", error);
    return { 
      success: false, 
      text: null, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

// Format chat history for VNYL API
export const formatChatHistoryForGemini = (messages: Array<{ isUser: boolean; text: string }>) => {
  return messages.map(message => ({
    role: message.isUser ? "user" as const : "model" as const,
    parts: [{ text: message.text }]
  }));
}; 