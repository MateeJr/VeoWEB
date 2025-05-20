import { Redis } from '@upstash/redis';
import { User } from '@/utils/auth';
import { ConversationHistory } from '@/utils/HistoryManager';

// Define interfaces for chat messages
export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  timestamp: string;
  conversationId?: string;
  title?: string;
  isReasoning?: boolean;
  thinkDuration?: number;
  images?: any[];
}

// Initialize Redis client with provided credentials
export const redis = new Redis({
  url: "https://allowed-martin-10176.upstash.io",
  token: "ASfAAAIjcDE5MjdmY2M3ZjFlMzk0YzQzYjEzMzRjY2E3ZTdlNmFhMHAxMA"
});

// === CHAT HISTORY FUNCTIONS ===

/**
 * Save a chat message to Redis
 * @param userId User ID associated with the chat
 * @param message Chat message object
 */
export async function saveChatMessage(userId: string, message: ChatMessage) {
  // Store messages in a list with user-specific key
  await redis.lpush(`chat:history:${userId}`, JSON.stringify(message));
}

/**
 * Get chat history for a user
 * @param userId User ID to retrieve chat history for
 * @param limit Maximum number of messages to retrieve (default: 100)
 */
export async function getChatHistory(userId: string, limit = 100): Promise<ChatMessage[]> {
  // Get the latest messages using LRANGE (0 to limit-1)
  const messages = await redis.lrange(`chat:history:${userId}`, 0, limit - 1);
  
  // Parse JSON strings back to objects
  return messages.map(msg => JSON.parse(msg) as ChatMessage);
}

/**
 * Delete all chat history for a user
 * @param userId User ID to delete chat history for
 */
export async function deleteChatHistory(userId: string) {
  await redis.del(`chat:history:${userId}`);
}

/**
 * Delete a specific chat message
 * @param userId User ID
 * @param messageId Message ID to delete
 */
export async function deleteChatMessage(userId: string, messageId: string) {
  // Get all messages
  const messages = await getChatHistory(userId, 1000);
  
  // Filter out the message to delete
  const filteredMessages = messages.filter(msg => msg.id !== messageId);
  
  // Delete the old list and create a new one
  await redis.del(`chat:history:${userId}`);
  
  // If there are messages left, add them back
  if (filteredMessages.length > 0) {
    const promises = filteredMessages.map(msg => 
      redis.lpush(`chat:history:${userId}`, JSON.stringify(msg))
    );
    await Promise.all(promises);
  }
}

// === USER ACCOUNT FUNCTIONS ===

/**
 * Save user data to Redis
 * @param user User object to save
 */
export async function saveUser(user: User) {
  // Store user as a hash under their email
  await redis.hset(`user:${user.email}`, user as unknown as Record<string, unknown>);
  
  // Also maintain a set of all user emails for listing
  await redis.sadd('users:all', user.email);
}

/**
 * Get a user by email
 * @param email Email to lookup
 */
export async function getUserByEmail(email: string) {
  const user = await redis.hgetall(`user:${email}`);
  return user && Object.keys(user).length ? user : null;
}

/**
 * Get all users
 */
export async function getAllUsers() {
  const userEmails = await redis.smembers('users:all');
  const users = [];
  
  for (const email of userEmails) {
    const user = await getUserByEmail(email);
    if (user) {
      users.push(user);
    }
  }
  
  return users;
}

/**
 * Delete a user
 * @param email User email to delete
 */
export async function deleteUser(email: string) {
  await redis.del(`user:${email}`);
  await redis.srem('users:all', email);
  
  // Also delete their chat history and conversations
  await deleteAllConversationsForUser(email);
}

/**
 * Update user properties
 * @param email User email to update
 * @param updates Object with properties to update
 */
export async function updateUser(email: string, updates: Record<string, any>) {
  await redis.hset(`user:${email}`, updates);
}

// === CONVERSATION HISTORY FUNCTIONS ===

/**
 * Save conversation to Redis
 * @param userId User ID associated with the conversation
 * @param conversation Conversation data to save
 */
export async function saveConversationToRedis(userId: string, conversation: ConversationHistory): Promise<boolean> {
  try {
    // Ensure messages is always stringified before saving
    const messagesString = typeof conversation.messages === 'string' 
      ? conversation.messages 
      : JSON.stringify(conversation.messages);
    
    // Store conversation as a hash
    await redis.hset(`conversation:${userId}:${conversation.id}`, {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: messagesString
    });
    
    // Add to user's conversation list
    await redis.sadd(`user:${userId}:conversations`, conversation.id);
    
    return true;
  } catch (error) {
    console.error('Failed to save conversation to Redis:', error);
    return false;
  }
}

/**
 * Load conversation from Redis
 * @param userId User ID
 * @param conversationId Conversation ID
 */
export async function loadConversationFromRedis(userId: string, conversationId: string): Promise<ConversationHistory | null> {
  try {
    const data = await redis.hgetall(`conversation:${userId}:${conversationId}`);
    
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    
    // Use our utility function to ensure consistent message format
    const messages = ensureMessagesConsistency(data.messages);
    
    return {
      id: data.id as string,
      title: data.title as string,
      createdAt: data.createdAt as string,
      updatedAt: data.updatedAt as string,
      messages: messages
    };
  } catch (error) {
    console.error('Failed to load conversation from Redis:', error);
    return null;
  }
}

/**
 * List all conversations for a user from Redis
 * @param userId User ID
 */
export async function listUserConversationsFromRedis(userId: string): Promise<ConversationHistory[]> {
  try {
    const conversationIds = await redis.smembers(`user:${userId}:conversations`);
    const conversations = [];
    
    for (const id of conversationIds) {
      try {
        const data = await redis.hgetall(`conversation:${userId}:${id}`);
        
        if (data && Object.keys(data).length > 0) {
          // Use our utility function to ensure consistent message format
          const messages = ensureMessagesConsistency(data.messages);
          
          conversations.push({
            id: data.id as string,
            title: data.title as string,
            createdAt: data.createdAt as string,
            updatedAt: data.updatedAt as string,
            messages: messages
          });
        }
      } catch (innerError) {
        console.error(`Error loading conversation ${id} for user ${userId}:`, innerError);
        // Continue with other conversations
      }
    }
    
    // Sort by updatedAt (newest first)
    return conversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Failed to list conversations from Redis:', error);
    return [];
  }
}

/**
 * Delete a conversation from Redis
 * @param userId User ID
 * @param conversationId Conversation ID
 */
export async function deleteConversationFromRedis(userId: string, conversationId: string): Promise<boolean> {
  try {
    // Remove from user's conversation set
    await redis.srem(`user:${userId}:conversations`, conversationId);
    
    // Delete the conversation hash
    await redis.del(`conversation:${userId}:${conversationId}`);
    
    return true;
  } catch (error) {
    console.error('Failed to delete conversation from Redis:', error);
    return false;
  }
}

/**
 * Delete all conversations for a user from Redis
 * @param userId User ID
 */
export async function deleteAllConversationsForUser(userId: string): Promise<boolean> {
  try {
    const conversationIds = await redis.smembers(`user:${userId}:conversations`);
    
    // Delete each conversation
    for (const id of conversationIds) {
      await deleteConversationFromRedis(userId, id);
    }
    
    // Clear the user's conversation set
    await redis.del(`user:${userId}:conversations`);
    
    return true;
  } catch (error) {
    console.error('Failed to delete all conversations from Redis:', error);
    return false;
  }
}

/**
 * Utility function to help ensure message format consistency
 * @param messages Messages array or string
 */
export function ensureMessagesConsistency(messages: any): any[] {
  if (typeof messages === 'string') {
    try {
      return JSON.parse(messages);
    } catch (error) {
      console.error('Error parsing messages:', error);
      return [];
    }
  } else if (Array.isArray(messages)) {
    return messages;
  } else if (messages && typeof messages === 'object') {
    // Handle case where messages might be a nested object
    return [messages];
  }
  return [];
} 