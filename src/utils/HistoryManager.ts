// Define interfaces for history storage
export interface MessageHistory {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isReasoning?: boolean; // Add flag to store if reason mode was on
  thinkDuration?: number; // Add duration of thinking in milliseconds
  images?: { data: string; type: string; name: string }[]; // Add support for storing images
}

export interface ConversationHistory {
  id: string;
  title: string;
  messages: MessageHistory[];
  createdAt: string;
  updatedAt: string;
}

// Save conversation through API
export const saveConversation = async (userId: string, conversation: ConversationHistory): Promise<boolean> => {
  try {
    const response = await fetch('/api/history/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, conversation }),
    });
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Failed to save conversation:', error);
    return false;
  }
};

// Load conversation through API
export const loadConversation = async (userId: string, conversationId: string): Promise<ConversationHistory | null> => {
  try {
    const response = await fetch(`/api/history/get?userId=${encodeURIComponent(userId)}&conversationId=${encodeURIComponent(conversationId)}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.conversation as ConversationHistory;
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return null;
  }
};

// List all conversations through API
export const listConversations = async (userId: string): Promise<ConversationHistory[]> => {
  try {
    const response = await fetch(`/api/history/list?userId=${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    console.error('Failed to list conversations:', error);
    return [];
  }
};

// Search conversations by content
export const searchConversationsContent = async (userId: string, query: string): Promise<ConversationHistory[]> => {
  try {
    // First, get all conversations
    const allConversations = await listConversations(userId);
    
    if (!query.trim()) {
      return allConversations;
    }
    
    // Search in both title and message content
    const lowerQuery = query.toLowerCase().trim();
    return allConversations.filter(conversation => {
      // Check if conversation object and title exist
      if (!conversation || typeof conversation !== 'object') {
        return false;
      }
      
      // Check title if it exists
      if (conversation.title && conversation.title.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Check message content if messages array exists and is not empty
      if (conversation.messages && Array.isArray(conversation.messages) && conversation.messages.length > 0) {
        return conversation.messages.some(message => 
          message && message.content && message.content.toLowerCase().includes(lowerQuery)
        );
      }
      
      return false;
    });
  } catch (error) {
    console.error('Failed to search conversations:', error);
    return [];
  }
};

// Delete a conversation through API
export const deleteConversation = async (userId: string, conversationId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/history/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, conversationId }),
    });
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    return false;
  }
};

// Delete all conversations for a user
export const deleteAllConversations = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/history/delete-all', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Failed to delete all conversations:', error);
    return false;
  }
};

// Convert ChatMessage array to MessageHistory array
export const convertChatMessagesToHistory = (messages: any[]): MessageHistory[] => {
  return messages.map(msg => ({
    role: msg.isUser ? 'user' : 'model',
    content: msg.text,
    timestamp: msg.timestamp.toISOString(),
    isReasoning: msg.isReasoning, // Store reasoning flag
    thinkDuration: msg.thinkDuration, // Store thinking duration
    images: msg.images // Store images if present
  }));
};

// Generate a new conversation ID
export const generateConversationId = (): string => {
  return `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Get conversation title (using the first user message as title)
export const generateConversationTitle = (messages: MessageHistory[]): string => {
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  if (firstUserMessage) {
    const title = firstUserMessage.content.substring(0, 50);
    return title.length < firstUserMessage.content.length ? `${title}...` : title;
  }
  return `Conversation ${new Date().toLocaleString()}`;
}; 