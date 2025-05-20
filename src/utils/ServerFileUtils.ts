import fs from 'fs';
import path from 'path';
import { ConversationHistory } from './HistoryManager';

// Ensure this code only runs on the server
const isServer = typeof window === 'undefined';

// Path to the history directory
export const getHistoryDir = () => {
  if (!isServer) {
    throw new Error('ServerFileUtils can only be used on the server side');
  }
  return path.join(process.cwd(), 'HISTORY');
};

// Path to a user's history directory
export const getUserHistoryDir = (userId: string) => {
  if (!isServer) {
    throw new Error('ServerFileUtils can only be used on the server side');
  }
  
  if (!userId) {
    throw new Error('User ID is required - cannot store conversations without a user ID');
  }
  
  return path.join(getHistoryDir(), userId);
};

// Create necessary directories
export const ensureDirectoriesExist = (userId: string) => {
  if (!isServer) {
    throw new Error('ServerFileUtils can only be used on the server side');
  }
  
  if (!userId) {
    throw new Error('User ID is required - cannot create directories without a user ID');
  }
  
  const historyDir = getHistoryDir();
  const userDir = getUserHistoryDir(userId);
  
  console.log(`Ensuring directories exist: ${historyDir} / ${userDir}`);
  
  if (!fs.existsSync(historyDir)) {
    console.log(`Creating history directory: ${historyDir}`);
    fs.mkdirSync(historyDir, { recursive: true });
  }
  
  if (!fs.existsSync(userDir)) {
    console.log(`Creating user directory: ${userDir}`);
    fs.mkdirSync(userDir, { recursive: true });
  }
  
  return userDir;
};

// Save conversation to JSON file
export const saveConversationToFile = (userId: string, conversation: ConversationHistory) => {
  if (!isServer) {
    throw new Error('ServerFileUtils can only be used on the server side');
  }
  
  if (!userId) {
    throw new Error('User ID is required - cannot save conversation without a user ID');
  }
  
  const userDir = ensureDirectoriesExist(userId);
  const filePath = path.join(userDir, `${conversation.id}.json`);
  
  console.log(`Saving conversation to: ${filePath}`);
  
  fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2));
  console.log(`Successfully saved conversation: ${conversation.id}`);
};

// Load conversation from JSON file
export const loadConversationFromFile = (userId: string, conversationId: string): ConversationHistory | null => {
  if (!isServer) {
    throw new Error('ServerFileUtils can only be used on the server side');
  }
  
  if (!userId) {
    throw new Error('User ID is required - cannot load conversation without a user ID');
  }
  
  const filePath = path.join(getUserHistoryDir(userId), `${conversationId}.json`);
  
  console.log(`Attempting to load conversation from: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`File exists, reading: ${filePath}`);
    const data = fs.readFileSync(filePath, 'utf-8');
    const conversation = JSON.parse(data) as ConversationHistory;
    console.log(`Loaded conversation with ${conversation.messages.length} messages`);
    return conversation;
  }
  
  console.log(`File not found: ${filePath}`);
  return null;
};

// List all conversations for a user
export const listUserConversations = (userId: string): ConversationHistory[] => {
  if (!isServer) {
    throw new Error('ServerFileUtils can only be used on the server side');
  }
  
  if (!userId) {
    throw new Error('User ID is required - cannot list conversations without a user ID');
  }
  
  const userDir = getUserHistoryDir(userId);
  
  console.log(`Listing conversations in: ${userDir}`);
  
  if (!fs.existsSync(userDir)) {
    console.log(`User directory doesn't exist: ${userDir}`);
    return [];
  }
  
  try {
    const files = fs.readdirSync(userDir).filter(file => file.endsWith('.json'));
    console.log(`Found ${files.length} conversations for user: ${userId}`);
    
    return files.map(file => {
      const filePath = path.join(userDir, file);
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as ConversationHistory;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error(`Error listing conversations for ${userId}:`, error);
    return [];
  }
};

// Delete a conversation
export const deleteConversationFile = (userId: string, conversationId: string): boolean => {
  if (!isServer) {
    throw new Error('ServerFileUtils can only be used on the server side');
  }
  
  if (!userId) {
    throw new Error('User ID is required - cannot delete conversation without a user ID');
  }
  
  const filePath = path.join(getUserHistoryDir(userId), `${conversationId}.json`);
  
  console.log(`Attempting to delete conversation: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Successfully deleted: ${filePath}`);
    return true;
  }
  
  console.log(`File not found, cannot delete: ${filePath}`);
  return false;
};

// Delete all conversations for a user
export const deleteAllConversationsForUser = (userId: string): boolean => {
  if (!isServer) {
    throw new Error('ServerFileUtils can only be used on the server side');
  }
  
  if (!userId) {
    throw new Error('User ID is required - cannot delete conversations without a user ID');
  }
  
  const userDir = getUserHistoryDir(userId);
  
  if (!fs.existsSync(userDir)) {
    console.log(`User directory not found: ${userDir}`);
    return false;
  }
  
  let success = true;
  try {
    // Read all files in the user directory
    const files = fs.readdirSync(userDir);
    
    // Delete each conversation file
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(userDir, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted conversation: ${filePath}`);
      }
    }
    
    console.log(`Successfully deleted all conversations for user: ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting all conversations for user ${userId}:`, error);
    return false;
  }
}; 