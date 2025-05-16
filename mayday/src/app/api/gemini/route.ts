import { NextRequest, NextResponse } from "next/server";
import { generateResponse, formatChatHistoryForGemini, isGeminiConfigured, safetySettings } from "@/utils/gemini";

export async function POST(request: NextRequest) {
  try {
    // Check if VNYL AI is configured
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "VNYL AI is not configured. Please add your API key to the .env file." },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { prompt, history = [], searchEnabled = false } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Format history for VNYL if provided
    const formattedHistory = history.length > 0 
      ? formatChatHistoryForGemini(history) 
      : [];

    // Generate response from VNYL with safety settings turned OFF and optional search grounding
    const response = await generateResponse(prompt, formattedHistory, searchEnabled);

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || "Failed to generate response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      response: response.text,
      success: true,
      searchWasEnabled: response.searchWasEnabled // Return whether search was used (for debugging)
    });
  } catch (error) {
    console.error("Error in VNYL API route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
} 