// Configuration Section - All configurable variables in one place
const CONFIG = {
  // Admin configuration
  ADMIN_NUMBER: "+6285172196650",
  
  // Bot state flags
  BOT_STATE: {
    GLOBAL_MUTE: false,
    MAINTENANCE_MODE: false
  },
  
  // AI Models configuration
  AI_MODELS: {
    CHAT: "gemini-2.5-pro-exp-03-25",
    IMAGE_GENERATION: "gemini-2.0-flash-exp"
  },
  
  // User-facing messages
  MESSAGES: {
    THINKING: "🟢 Thinking...",
    ANALYZING_IMAGE: "🔴 Analyzing your image...",
    ANALYZING_VIDEO: "🔴 Analyzing your video...",
    GENERATING_IMAGE: "🔵 Generating image...",
    EDITING_IMAGE: "🔵 Editing your image...",
    RETRYING: "🔄 System Error! Auto-Retrying, Please Wait",
    ERROR_CONTACT_ADMIN: "❌ System Completely Error, Contact Developer +6285172196650, or Wait for 10 minutes",
    IMAGE_GEN_ERROR: "🚫 Image generation failed. Retry or Contact Developer +6285172196650, or Wait for 10 minutes",
    VIDEO_PROCESSING_ERROR: "🚫 Video processing failed. The video might be too large or in an unsupported format.",
    NSFW_BLOCKED: "🔞 NSFW DETECTED: *BLOCKED*",
    ACCESS_DENIED: "⛔ Access denied. This command is only available for Developer.",
    CHANGING_PROFILE_PIC: "🖼️ Changing profile picture...",
    CHANGING_PROFILE_NAME: "📝 Changing profile name...",
    GENERATED_IMAGE_CAPTION: "🎉 Here's your generated image:",
    MAINTENANCE_MODE: "[DEV] 🛠️ Veo sedang dalam perbaikan. Coba lagi nanti.",
    BOT_MUTED: "🔇 I've been muted by Developer.",
    USER_MUTED: "Your number has been muted by the Developer.",
    IMAGE_GEN_MAINTENANCE: "Image Generation is under maintenance"
  },
  
  // Console log messages
  CONSOLE: {
    COMPRESSING_IMAGE: "Compressing image...",
    IMAGE_COMPRESSED: "Image compressed: {0} bytes → {1} bytes ({2}%)",
    SAVED_COMPRESSED_IMAGE: "Saved compressed image to {0}",
    CREATED_DIRECTORY: "Created directory: {0}",
    LOADED_IMAGE: "Successfully loaded image from: {0}",
    ERROR_LOADING_IMAGE: "Error loading image: {0}",
    LOADED_GENERATED_IMAGE: "Successfully loaded generated image from: {0}",
    ERROR_LOADING_GENERATED_IMAGE: "Error loading generated image: {0}",
    LOADED_CUSTOM_PROMPT: "Loaded custom system prompt from system.txt",
    CREATED_DEFAULT_PROMPT: "Created system.txt with default system prompt",
    ERROR_LOADING_PROMPT: "Error loading system prompt: {0}",
    PROCESSING_IMAGE: "Processing image...",
    PROCESSING_VIDEO: "Processing video...",
    VIDEO_DOWNLOADED: "Video downloaded, saving to file...",
    VIDEO_SAVED: "Video saved to: {0}",
    ERROR_PROCESSING_VIDEO: "Error processing video: {0}",
    LOADED_VIDEO: "Successfully loaded video from: {0}",
    ERROR_LOADING_VIDEO: "Error loading video: {0}",
    VIDEO_TOO_LARGE: "Video size exceeds limit: {0}MB (max: 20MB)",
    IMAGE_DOWNLOADED: "Image downloaded, saving to file...",
    IMAGE_PROCESSED: "Image processed successfully, reference: {0}",
    ERROR_PROCESSING_IMAGE: "Error processing image: {0}",
    PROCESSING_VOICE_NOTE: "Processing voice note...",
    VOICE_NOTE_SAVED: "Voice note saved to: {0}",
    ERROR_PROCESSING_VOICE_NOTE: "Error processing voice note: {0}",
    VOICE_NOTE_LOADED: "Successfully loaded voice note from: {0}",
    ERROR_LOADING_VOICE_NOTE: "Error loading voice note: {0}",
    CLEARED_VOICE_NOTES_DIR: "Cleared voice notes directory: {0}",
    CLEARED_VIDEOS_DIR: "Cleared videos directory: {0}",
    HISTORICAL_IMAGE_LOADING: "Loading historical image with ID: {0} from sender: {1}",
    HISTORICAL_VIDEO_LOADING: "Loading historical video with ID: {0} from sender: {1}",
    HISTORICAL_IMAGE_LOADED: "Successfully loaded historical image: {0} and added to context",
    HISTORICAL_VIDEO_LOADED: "Successfully loaded historical video: {0} and added to context",
    HISTORICAL_IMAGE_LOAD_FAILED: "Failed to load historical image: {0}",
    HISTORICAL_VIDEO_LOAD_FAILED: "Failed to load historical video: {0}",
    API_ATTEMPT: "[Attempt {0}] Sending to Gemini with API key",
    SENDING_TO_GEMINI: "Sending to Gemini with {0} messages in history",
    RECEIVED_GEMINI_RESPONSE: "Received response from Gemini",
    RETRY_FAILED: "Attempt {0} failed: {1}",
    FINAL_ERROR: "Final error after retries: {0}",
    ERROR_MESSAGES: "Error messages: {0}",
    UPLOADED_IMAGE_FOUND: "Found historical uploaded image: {0}",
    UPLOADED_IMAGE_LOADED: "Successfully loaded historical uploaded image: {0}",
    GENERATED_IMAGE_FOUND: "Found historical generated image: {0}",
    GENERATED_IMAGE_LOADED: "Successfully loaded historical generated image: {0}",
    CONTEXT_IMAGES_ADDED: "Added {0} images to context (including current upload: {1})",
    CONTEXT_VIDEOS_ADDED: "Added {0} videos to context (including current upload: {1})",
    IMAGE_GEN_REQUEST_PARAMS: "Image generation request parameters: {0}",
    IMAGE_GEN_RESPONSE: "Received image generation response: {0}",
    GENERATED_IMAGE_SAVED: "Generated image saved to: {0}",
    IMAGE_GEN_ERROR_DETAILS: "Image generation error details: {0}",
    CLEARED_CHAT_IMAGE_DIR: "Cleared chat image directory: {0}",
    CLEARED_CHAT_VIDEO_DIR: "Cleared chat video directory: {0}",
    CLEARED_GENERATED_IMAGE_DIR: "Cleared generated image directory: {0}",
    CLEARED_UPLOADED_IMAGES_DIR: "Cleared uploaded images directory: {0}",
    ERROR_IN_MAIN: "Error in main function: {0}"
  },
  
  // Safety settings
  SAFETY_SETTINGS: {
    CHAT: [
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
        threshold: "BLOCK_NONE",
      }
    ],
    IMAGE_GENERATION: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_CIVIC_INTEGRITY", 
        threshold: "BLOCK_NONE",
      }
    ]
  },
  
  // System settings
  SYSTEM: {
    MAX_RETRIES: 18,
    MAX_CONTEXT_IMAGES: 10,
    MAX_CONTEXT_VIDEOS: 3,
    MAX_VIDEO_SIZE_MB: 64, // Maximum video size in MB
    IMAGE_COMPRESSION: {
      MAX_WIDTH: 1280,
      MAX_HEIGHT: 720,
      JPEG_QUALITY: 80,
      PNG_COMPRESSION: 8
    }
  },
  
  // Menu text
  MENU_TEXT: `*✨ Veo AI Assistant ✨*

Veo adalah asisten AI Gen-Z yang cerdas dan seru by Vallian! 🌟

Gunakan {0}a untuk bertanya apa saja atau analisis gambar/video 📸 🎬
Gunakan {0}g untuk membuat gambar dengan AI 🎨
`
};

const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const util = require("util");
const path = require("path");
const chalk = require("chalk");
const sharp = require("sharp");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKeyPool = require("./lib/apiKeyPool");
let setting = require("./key.json");
const historyManager = require("./lib/historyManager");
const axios = require("axios");

// Admin configuration - only this number can access admin features
const ADMIN_NUMBER = CONFIG.ADMIN_NUMBER;

// Path to muted users file
const MUTED_USERS_FILE = path.join(process.cwd(), 'muted_users.json');

// Function to load muted users from file
function loadMutedUsers() {
  try {
    if (fs.existsSync(MUTED_USERS_FILE)) {
      const data = fs.readFileSync(MUTED_USERS_FILE, 'utf8');
      return JSON.parse(data);
    } else {
      // Create default file if it doesn't exist
      const defaultData = { users: [] };
      fs.writeFileSync(MUTED_USERS_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
  } catch (error) {
    console.error(chalk.red(`Error loading muted users: ${error.message}`));
    return { users: [] };
  }
}

// Function to save muted users to file
function saveMutedUsers(mutedUsers) {
  try {
    fs.writeFileSync(MUTED_USERS_FILE, JSON.stringify(mutedUsers, null, 2));
    return true;
  } catch (error) {
    console.error(chalk.red(`Error saving muted users: ${error.message}`));
    return false;
  }
}

// Function to add user to muted list
function muteUser(phoneNumber) {
  // Normalize the phone number (remove + and add @s.whatsapp.net)
  const normalizedNumber = normalizePhoneNumber(phoneNumber);
  
  // Load current muted users
  const mutedUsers = loadMutedUsers();
  
  // Check if user is already muted
  if (!mutedUsers.users.includes(normalizedNumber)) {
    mutedUsers.users.push(normalizedNumber);
    return saveMutedUsers(mutedUsers);
  }
  
  return false; // User already muted
}

// Function to remove user from muted list
function unmuteUser(phoneNumber) {
  // Normalize the phone number
  const normalizedNumber = normalizePhoneNumber(phoneNumber);
  
  // Load current muted users
  const mutedUsers = loadMutedUsers();
  
  // Get the index of the user in the array
  const index = mutedUsers.users.indexOf(normalizedNumber);
  
  // If user is found in the muted list, remove them
  if (index !== -1) {
    mutedUsers.users.splice(index, 1);
    return saveMutedUsers(mutedUsers);
  }
  
  return false; // User not found in muted list
}

// Function to check if a user is muted
function isUserMuted(sender) {
  try {
    const mutedUsers = loadMutedUsers();
    return mutedUsers.users.includes(sender);
  } catch (error) {
    console.error(chalk.red(`Error checking muted status: ${error.message}`));
    return false;
  }
}

// Function to normalize phone number to WhatsApp format
function normalizePhoneNumber(phoneNumber) {
  // Remove any non-digit characters
  let normalized = phoneNumber.replace(/\D/g, '');
  
  // If number starts with 0, replace with 62 (Indonesia)
  if (normalized.startsWith('0')) {
    normalized = '62' + normalized.substring(1);
  }
  
  // If number doesn't start with 62, add it (Indonesia)
  if (!normalized.startsWith('62')) {
    normalized = '62' + normalized;
  }
  
  // Add WhatsApp suffix
  return normalized + '@s.whatsapp.net';
}

// Function to ensure directory exists
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(chalk.green(CONFIG.CONSOLE.CREATED_DIRECTORY.replace("{0}", directory)));
  }
}

// Function to compress image to a maximum size of 1280x720
async function compressImage(buffer, mimetype) {
  try {
    console.log(chalk.green(CONFIG.CONSOLE.COMPRESSING_IMAGE));
    
    // Create a sharp instance from the buffer
    const image = sharp(buffer);
    
    // Get image metadata
    const metadata = await image.metadata();
    
    // Determine if resize is needed
    const needsResize = metadata.width > CONFIG.SYSTEM.IMAGE_COMPRESSION.MAX_WIDTH || metadata.height > CONFIG.SYSTEM.IMAGE_COMPRESSION.MAX_HEIGHT;
    
    // Set up compression options
    let processedImage = image;
    
    if (needsResize) {
      // Resize the image while maintaining aspect ratio
      processedImage = processedImage.resize({
        width: Math.min(CONFIG.SYSTEM.IMAGE_COMPRESSION.MAX_WIDTH, metadata.width),
        height: Math.min(CONFIG.SYSTEM.IMAGE_COMPRESSION.MAX_HEIGHT, metadata.height),
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Determine output format based on mimetype
    let outputOptions = {};
    let outputFormat;
    
    if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
      outputFormat = 'jpeg';
      outputOptions = { quality: CONFIG.SYSTEM.IMAGE_COMPRESSION.JPEG_QUALITY };  // 80% quality for JPEG
    } else if (mimetype === 'image/png') {
      outputFormat = 'png';
      outputOptions = { compressionLevel: CONFIG.SYSTEM.IMAGE_COMPRESSION.PNG_COMPRESSION }; // Higher compression for PNG
    } else if (mimetype === 'image/webp') {
      outputFormat = 'webp';
      outputOptions = { quality: CONFIG.SYSTEM.IMAGE_COMPRESSION.JPEG_QUALITY };
    } else {
      // Default to JPEG for other formats
      outputFormat = 'jpeg';
      outputOptions = { quality: CONFIG.SYSTEM.IMAGE_COMPRESSION.JPEG_QUALITY };
      mimetype = 'image/jpeg';
    }
    
    // Convert to the chosen format with options
    processedImage = processedImage[outputFormat](outputOptions);
    
    // Get the compressed buffer
    const compressedBuffer = await processedImage.toBuffer();
    
    console.log(chalk.green(CONFIG.CONSOLE.IMAGE_COMPRESSED.replace("{0}", buffer.length).replace("{1}", compressedBuffer.length).replace("{2}", Math.round(compressedBuffer.length / buffer.length * 100))));
    
    return {
      buffer: compressedBuffer,
      mimetype
    };
  } catch (error) {
    console.error(chalk.red(CONFIG.CONSOLE.ERROR_PROCESSING_IMAGE.replace("{0}", error.message)));
    // Return original if compression fails
    return { buffer, mimetype };
  }
}

// Function to save image and return its ID
async function saveImageToFile(buffer, sender, mimetype) {
  // Compress the image first
  const compressed = await compressImage(buffer, mimetype);
  
  // Get user directory from historyManager
  const chatId = sender; // This could be either a user ID or group ID
  const userDir = historyManager.getUserDirectory(chatId);
  
  // Create images subdirectory if it doesn't exist
  const imagesDir = path.join(userDir, 'images');
  ensureDirectoryExists(imagesDir);
  
  // Generate unique ID for the image
  const imageId = Date.now();
  const extension = compressed.mimetype.split('/')[1];
  const fileName = `${imageId}.${extension}`;
  const filePath = path.join(imagesDir, fileName);
  
  // Save image to file
  fs.writeFileSync(filePath, compressed.buffer);
  console.log(chalk.green(CONFIG.CONSOLE.SAVED_COMPRESSED_IMAGE.replace("{0}", filePath)));
  
  return {
    id: imageId,
    path: filePath,
    mimetype: compressed.mimetype,
    buffer: compressed.buffer
  };
}

// Function to save video and return its ID
async function saveVideoToFile(buffer, sender, mimetype) {
  try {
    // Check video size (20MB limit is suggested in the Gemini Video Guide)
    const videoSizeMB = buffer.length / (1024 * 1024);
    if (videoSizeMB > CONFIG.SYSTEM.MAX_VIDEO_SIZE_MB) {
      console.error(chalk.red(CONFIG.CONSOLE.VIDEO_TOO_LARGE.replace("{0}", videoSizeMB.toFixed(2))));
      throw new Error(`Video size exceeds ${CONFIG.SYSTEM.MAX_VIDEO_SIZE_MB}MB limit`);
    }
    
    // Get user directory from historyManager
    const chatId = sender; // This could be either a user ID or group ID
    const userDir = historyManager.getUserDirectory(chatId);
    
    // Create videos subdirectory if it doesn't exist
    const videosDir = path.join(userDir, 'videos');
    ensureDirectoryExists(videosDir);
    
    // Generate unique ID for the video
    const videoId = Date.now();
    const extension = mimetype.split('/')[1];
    const fileName = `${videoId}.${extension}`;
    const filePath = path.join(videosDir, fileName);
    
    // Save video to file
    fs.writeFileSync(filePath, buffer);
    console.log(chalk.green(CONFIG.CONSOLE.VIDEO_SAVED.replace("{0}", filePath)));
    
    return {
      id: videoId,
      path: filePath,
      mimetype: mimetype,
      buffer: buffer
    };
  } catch (error) {
    console.error(chalk.red(CONFIG.CONSOLE.ERROR_PROCESSING_VIDEO.replace("{0}", error.message)));
    throw error;
  }
}

// Function to load image from file and convert to base64
function loadImageAsBase64(imageReference, chatId) {
  try {
    const parts = imageReference.split(':');
    if (parts.length !== 2) return null;
    
    const imageId = parts[1];
    // Get user directory from historyManager
    // For historical compatibility, we need to check if chatId is a message object
    const actualChatId = typeof chatId === 'object' ? chatId.chat : chatId;
    const userDir = historyManager.getUserDirectory(actualChatId);
    const imagesDir = path.join(userDir, 'images');
    
    // Check if images directory exists
    if (!fs.existsSync(imagesDir)) {
      console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_IMAGE.replace("{0}", imagesDir)));
      return null;
    }
    
    // Get all files in the directory
    const files = fs.readdirSync(imagesDir);
    const imageFile = files.find(file => file.startsWith(imageId + '.'));
    
    if (!imageFile) {
      console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_IMAGE.replace("{0}", imageId)));
      return null;
    }
    
    const filePath = path.join(imagesDir, imageFile);
    const buffer = fs.readFileSync(filePath);
    const mimetype = 'image/' + imageFile.split('.').pop();
    
    console.log(chalk.green(CONFIG.CONSOLE.LOADED_IMAGE.replace("{0}", filePath)));
    
    return {
      data: buffer.toString('base64'),
      mimeType: mimetype
    };
  } catch (error) {
    console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_IMAGE.replace("{0}", error.message)));
    return null;
  }
}

// Function to load video from file and convert to base64
function loadVideoAsBase64(videoReference, chatId) {
  try {
    const parts = videoReference.split(':');
    if (parts.length !== 2) return null;
    
    const videoId = parts[1];
    // Get user directory from historyManager
    // For historical compatibility, we need to check if chatId is a message object
    const actualChatId = typeof chatId === 'object' ? chatId.chat : chatId;
    const userDir = historyManager.getUserDirectory(actualChatId);
    const videosDir = path.join(userDir, 'videos');
    
    // Check if videos directory exists
    if (!fs.existsSync(videosDir)) {
      console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_VIDEO.replace("{0}", videosDir)));
      return null;
    }
    
    // Get all files in the directory
    const files = fs.readdirSync(videosDir);
    const videoFile = files.find(file => file.startsWith(videoId + '.'));
    
    if (!videoFile) {
      console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_VIDEO.replace("{0}", videoId)));
      return null;
    }
    
    const filePath = path.join(videosDir, videoFile);
    const buffer = fs.readFileSync(filePath);
    const mimetype = 'video/' + videoFile.split('.').pop();
    
    console.log(chalk.green(CONFIG.CONSOLE.LOADED_VIDEO.replace("{0}", filePath)));
    
    return {
      data: buffer.toString('base64'),
      mimeType: mimetype
    };
  } catch (error) {
    console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_VIDEO.replace("{0}", error.message)));
    return null;
  }
}

// Function to load generated image from file and convert to base64
function loadGeneratedImageAsBase64(imageReference, chatId) {
  try {
    const parts = imageReference.split(':');
    if (parts.length !== 2) return null;
    
    const imageId = parts[1];
    // Get user directory for image_gen
    // For historical compatibility, we need to check if chatId is a message object
    const actualChatId = typeof chatId === 'object' ? chatId.chat : chatId;
    const userDir = historyManager.getUserDirectory(actualChatId, "image_gen");
    const imagesDir = path.join(userDir, 'generated');
    
    // Check if generated images directory exists
    if (!fs.existsSync(imagesDir)) {
      console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_GENERATED_IMAGE.replace("{0}", imagesDir)));
      return null;
    }
    
    // Get all files in the directory
    const files = fs.readdirSync(imagesDir);
    const imageFile = files.find(file => file.startsWith(imageId + '.'));
    
    if (!imageFile) {
      console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_GENERATED_IMAGE.replace("{0}", imageId)));
      return null;
    }
    
    const filePath = path.join(imagesDir, imageFile);
    const buffer = fs.readFileSync(filePath);
    const mimetype = 'image/' + imageFile.split('.').pop();
    
    console.log(chalk.green(CONFIG.CONSOLE.LOADED_GENERATED_IMAGE.replace("{0}", filePath)));
    
    return {
      data: buffer.toString('base64'),
      mimeType: mimetype
    };
  } catch (error) {
    console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_GENERATED_IMAGE.replace("{0}", error.message)));
    return null;
  }
}

// Function to load system prompt from file
function loadSystemPrompt() {
  const systemPromptPath = path.join(process.cwd(), 'system.txt');
  
  try {
    // Get current date and time in a readable format
    const now = new Date();
    const dateTimeStr = now.toLocaleString('id-ID', { 
      timeZone: 'Asia/Jakarta',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) + " WIB";
    
    // Add date/time prefix
    const dateTimePrefix = `Current DateTime: ${dateTimeStr}\n\n`;
    
    if (fs.existsSync(systemPromptPath)) {
      const systemPromptContent = fs.readFileSync(systemPromptPath, 'utf8');
      const systemPrompt = dateTimePrefix + systemPromptContent;
      console.log(chalk.green(CONFIG.CONSOLE.LOADED_CUSTOM_PROMPT));
      return systemPrompt;
    } else {
      // Create an empty system.txt file for manual editing
      fs.writeFileSync(systemPromptPath, "");
      console.log(chalk.green(CONFIG.CONSOLE.CREATED_DEFAULT_PROMPT));
      console.log(chalk.yellow("WARNING: system.txt is empty. Please edit it to add a system prompt."));
      
      return dateTimePrefix;
    }
  } catch (error) {
    console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_PROMPT.replace("{0}", error.message)));
    return "";
  }
}

// Function to load voice note from file and convert to base64
function loadVoiceNoteAsBase64(voiceNoteReference, chatId) {
  try {
    const parts = voiceNoteReference.split(':');
    if (parts.length !== 2) return null;
    
    const voiceNoteId = parts[1];
    // Get user directory from historyManager
    // For historical compatibility, we need to check if chatId is a message object
    const actualChatId = typeof chatId === 'object' ? chatId.chat : chatId;
    const userDir = historyManager.getUserDirectory(actualChatId);
    const voicenotesDir = path.join(userDir, 'voicenotes');
    
    // Check if voicenotes directory exists
    if (!fs.existsSync(voicenotesDir)) {
      console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_VOICE_NOTE.replace("{0}", voicenotesDir)));
      return null;
    }
    
    // Get all files in the directory
    const files = fs.readdirSync(voicenotesDir);
    const voiceNoteFile = files.find(file => file.startsWith(voiceNoteId + '.'));
    
    if (!voiceNoteFile) {
      console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_VOICE_NOTE.replace("{0}", voiceNoteId)));
      return null;
    }
    
    const filePath = path.join(voicenotesDir, voiceNoteFile);
    const buffer = fs.readFileSync(filePath);
    const mimetype = 'audio/mp3';
    
    console.log(chalk.green(CONFIG.CONSOLE.VOICE_NOTE_LOADED.replace("{0}", filePath)));
    
    return {
      data: buffer.toString('base64'),
      mimeType: mimetype,
      path: filePath
    };
  } catch (error) {
    console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_VOICE_NOTE.replace("{0}", error.message)));
    return null;
  }
}

// Process and save voice note
async function processVoiceNote(voiceMessage, sender) {
  try {
    console.log(chalk.green(CONFIG.CONSOLE.PROCESSING_VOICE_NOTE));
    
    // Get user directory from historyManager
    const chatId = sender;
    const userDir = historyManager.getUserDirectory(chatId);
    
    // Create voicenotes subdirectory if it doesn't exist
    const voicenotesDir = path.join(userDir, 'voicenotes');
    ensureDirectoryExists(voicenotesDir);
    
    // Generate unique ID for the voice note
    const voiceNoteId = Date.now();
    const fileName = `${voiceNoteId}.mp3`;
    const filePath = path.join(voicenotesDir, fileName);
    
    // Download the voice note
    const buffer = await downloadMediaMessage(
      voiceMessage,
      'buffer',
      {},
    );
    
    // Save voice note to file
    fs.writeFileSync(filePath, buffer);
    console.log(chalk.green(CONFIG.CONSOLE.VOICE_NOTE_SAVED.replace("{0}", filePath)));
    
    return {
      id: voiceNoteId,
      path: filePath,
      buffer: buffer
    };
  } catch (error) {
    console.error(chalk.red(CONFIG.CONSOLE.ERROR_PROCESSING_VOICE_NOTE.replace("{0}", error.message)));
    return null;
  }
}

module.exports = sansekai = async (upsert, sock, store, message) => {
  try {
    let budy = (typeof message.text == 'string' ? message.text : '')
    // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
    var prefix = /^[\\/!#.]/gi.test(budy) ? budy.match(/^[\\/!#.]/gi) : "/";
    let isCmd = budy.startsWith(prefix);
    let command = budy.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = budy.trim().split(/ +/).slice(1);
    const pushname = message.pushName || "No Name";
    const botNumber = sock.user.id;
    const itsMe = message.sender == botNumber ? true : false;
    let text = (q = args.join(" "));
    const arg = budy.trim().substring(budy.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);
    const from = message.chat;

    // Check if sender is admin
    const isAdmin = message.sender.replace("@s.whatsapp.net", "") === ADMIN_NUMBER.replace("+", "");

    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    // Group
    const groupMetadata = message.isGroup ? await sock.groupMetadata(message.chat).catch((e) => {}) : "";
    const groupName = message.isGroup ? groupMetadata.subject : "";

    // Push Message To Console
    let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;

    if (isCmd && !message.isGroup) {
      console.log(chalk.black(chalk.bgWhite("[ LOGS ]")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${message.sender.replace("@s.whatsapp.net", "")} ]`));
    } else if (isCmd && message.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${message.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
    }

    // Check if AI is mentioned in group chat
    if (message.isGroup && message.mentionedJid && message.mentionedJid.includes(botNumber)) {
      console.log(chalk.green("AI was mentioned in group chat"));
      return message.reply("Veo: Gunakan /a + pesanmu, untuk chat!");
    }

    // For private chats, treat regular messages as if "/a" command was used
    // This allows direct conversation without requiring the command prefix
    if (!isCmd && !message.isGroup && budy.trim() !== '') {
      command = "a";
      isCmd = true;
      // Set text to budy since we're treating this as a direct command
      text = budy;
      q = budy;
      console.log(chalk.green("Direct message in private chat, treating as /a command"));
      
      // Log the message to console similar to how command messages are logged
      console.log(chalk.black(chalk.bgWhite("[ LOGS ]")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${message.sender.replace("@s.whatsapp.net", "")} ]`));
    }

    // Check for voice note message directly in private chat (not in a group)
    if (!message.isGroup) {
      const messageType = getContentType(message.message);
      if (messageType === 'audioMessage' && message.message.audioMessage.ptt) {
        // This is a voice note (ptt = Push To Talk)
        console.log(chalk.green("Voice note detected in private chat"));
        
        // Send thinking message
        const thinkingMsg = await message.reply(CONFIG.MESSAGES.THINKING);
        let thinkingMsgKey = thinkingMsg.key;
        
        // Add gear emoji reaction to the user's message to indicate processing
        try {
          await sock.sendMessage(message.chat, {
            react: {
              text: "⚙️", // Gear emoji
              key: message.key
            }
          });
        } catch (reactError) {
          console.error("Error adding gear reaction:", reactError);
        }
        
        try {
          // Process and save the voice note
          const voiceNote = await processVoiceNote(message, message.chat);
          
          if (!voiceNote) {
            await sock.sendMessage(message.chat, { delete: thinkingMsgKey });
            return message.reply("❌ Gagal memproses voice note. Coba kirim ulang ya!");
          }
          
          // Create voice note reference tag
          const voiceNoteReference = `[VOICE_NOTE:${voiceNote.id}]`;
          
          // Get API key from the pool
          const geminiApiKey = apiKeyPool.getKey("keygemini");
          
          if (!geminiApiKey) {
            await sock.sendMessage(message.chat, { delete: thinkingMsgKey });
            return message.reply(CONFIG.MESSAGES.ERROR_CONTACT_ADMIN);
          }
          
          // Initialize Gemini AI with the selected API key
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          
          // Get the current date and time for system prompt
          const now = new Date();
          const dateTimeStr = now.toLocaleString('id-ID', { 
            timeZone: 'Asia/Jakarta',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }) + " WIB";
          
          // Load system prompt with current date/time
          const systemPrompt = `Current DateTime: ${dateTimeStr}\n\n${loadSystemPrompt()}`;
          
          // Convert audio to base64
          const audioData = fs.readFileSync(voiceNote.path);
          const audioBase64 = audioData.toString('base64');
          
          // Create Gemini model
          const model = genAI.getGenerativeModel({ 
            model: CONFIG.AI_MODELS.CHAT,
            systemInstruction: {
              parts: [{ text: systemPrompt }],
              role: "system"
            },
            safetySettings: CONFIG.SAFETY_SETTINGS.CHAT,
            tools: [{
              googleSearch: {}
            }]
          });
          
          // Prepare audio part
          const audioPart = {
            inlineData: {
              data: audioBase64,
              mimeType: "audio/mp3"
            }
          };
          
          // Get chat history
          const chatHistory = historyManager.getMessageHistory(message.chat);
          const recentMessages = chatHistory.slice(-60);
          
          // Create contents array for chat history
          const contents = [];
          
          // Add messages from history with proper roles for Gemini API
          if (recentMessages && recentMessages.length > 0) {
            for (const msg of recentMessages) {
              // Convert 'assistant' role to 'model' for Gemini API
              const geminiRole = msg.role === 'assistant' ? 'model' : msg.role;
              
              // Add message with proper role
              contents.push({
                role: geminiRole,
                parts: [{ text: msg.content }]
              });
            }
          }
          
          // Add current user message with audio part
          const userName = message.pushName || "User";
          
          // Add a text part with user's name first, then add the audio part
          contents.push({
            role: "user",
            parts: [{ text: `${userName}:` }]
          });
          
          // Add the audio part as a separate user message
          contents.push({
            role: "user",
            parts: [audioPart]
          });
          
          // Send to Gemini API and stream response
          const result = await model.generateContentStream({
            contents: contents,
            generationConfig: {
              responseModalities: ["TEXT"],
              temperature: 1,
              topP: 0.95,
              maxOutputTokens: 16834,
              candidateCount: 1,
              stopSequences: []
            },
            safetySettings: CONFIG.SAFETY_SETTINGS.CHAT
          });
          
          let responseText = "";
          let lastEditTime = 0;
          const editInterval = 1000; // Edit message at most every 1 second

          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              responseText += chunkText;
              const currentTime = Date.now();
              if (currentTime - lastEditTime > editInterval) {
                try {
                  await sock.sendMessage(message.chat, {
                    text: responseText + "...", // Add ellipsis to indicate streaming
                    edit: thinkingMsgKey,
                  });
                  lastEditTime = currentTime;
                } catch (editError) {
                  // Log error but continue streaming if possible
                  console.error(chalk.yellow("Error editing message during stream:", editError.message));
                }
              }
            }
          }
          
          // Send final edited message without ellipsis
          await sock.sendMessage(message.chat, {
            text: responseText,
            edit: thinkingMsgKey,
          });
          
          // Save voice note reference to history
          // First save the user's name message
          historyManager.saveMessageToHistory(message, 'user', `${userName}:`);
          
          // Then save the voice note reference
          historyManager.saveMessageToHistory(message, 'user', voiceNoteReference);
          
          // Save assistant response to history
          const assistantMessage = {
            chat: message.chat,
            botNumber: botNumber,
            pushName: "Veo"
          };
          historyManager.saveMessageToHistory(assistantMessage, 'assistant', responseText);
          
          // Change reaction from gear to check mark
          try {
            await sock.sendMessage(message.chat, {
              react: {
                text: "✅",
                key: message.key
              }
            });
          } catch (reactError) {
            console.error("Error adding check reaction:", reactError);
          }
          
        } catch (error) {
          console.error("Error processing voice note:", error);
          
          // Delete thinking message
          await sock.sendMessage(message.chat, { delete: thinkingMsgKey });
          
          // Send error message
          await message.reply("❌ Maaf, ada masalah saat memproses voice note. Coba lagi nanti ya!");
          
          // Change reaction to error
          try {
            await sock.sendMessage(message.chat, {
              react: {
                text: "❌",
                key: message.key
              }
            });
          } catch (reactError) {
            console.error("Error adding error reaction:", reactError);
          }
        }
        
        return;
      }
    }
    
    // Continue with existing handling for commands
    if (isCmd) {
      // Check for global mute or user-specific mute
      const senderNormalized = message.sender;
      
      // Skip mute checks for admin commands
      const adminCommands = ["mute", "unmute", "maintenanceon", "maintenanceoff", "say", "status", "addkey", "removekey", "listkeys", "clear", "reset", "clearg", "setpp", "setname"];
      
      // Commands that non-admin users can use in private chats
      const privateCommands = ["clear", "reset", "clearg"];
      const isPrivateChat = !message.isGroup;
      
      // Only check mute status for non-admin users and non-admin commands
      if (!isAdmin && !(isPrivateChat && privateCommands.includes(command)) && !adminCommands.includes(command)) {
        // Check if bot is globally muted
        if (CONFIG.BOT_STATE.GLOBAL_MUTE) {
          return message.reply(CONFIG.MESSAGES.BOT_MUTED);
        }
        
        // Check if user is specifically muted
        if (isUserMuted(senderNormalized)) {
          // Silently ignore muted users without sending a response
          return;
        }
        
        // Check if bot is in maintenance mode
        if (CONFIG.BOT_STATE.MAINTENANCE_MODE) {
          return message.reply(CONFIG.MESSAGES.MAINTENANCE_MODE);
        }
      }
      
      switch (command) {
        case "help": case "menu": case "start": case "info":
          if (isAdmin) {
            const adminMenu = `*✨ Veo AI Assistant - Admin Panel ✨*

*👋 Welcome, Admin!*
Veo adalah asisten AI Gen-Z yang cerdas dan seru by Vallian! 🌟

*📱 Regular Commands:*
${prefix}a [text/image/video] - Bertanya apa saja atau analisis gambar/video 📸 🎬 (hanya perlu di grup)
${prefix}g [prompt] - Membuat gambar dengan AI 🎨
${prefix}ge [prompt] - Mengedit gambar dengan AI (kirim gambar) 🖌️
${prefix}help/menu - Menampilkan menu bantuan ini 📃

*⚙️ Admin Controls:*
${prefix}mute - Mute Veo secara global (semua user tidak bisa akses)
${prefix}unmute - Unmute Veo secara global (kembalikan akses)
${prefix}mute [phone] - Mute user spesifik (format: +62xxx/08xxx)
${prefix}unmute [phone] - Unmute user spesifik

*🛠️ Maintenance:*
${prefix}maintenanceon - Aktifkan mode maintenance (semua user mendapat pesan maintenance)
${prefix}maintenanceoff - Nonaktifkan mode maintenance

*📊 System Management:*
${prefix}status - Tampilkan status sistem (API keys, memory, uptime)
${prefix}clear/reset - Hapus seluruh riwayat chat (chat + images + videos)
${prefix}clearg - Hapus riwayat image generation saja

*👤 Bot Profile:*
${prefix}setpp - Ganti foto profil bot (kirim dengan gambar)
${prefix}setname [name] - Ganti nama profil bot

*🔑 API Management:*
${prefix}addkey [service] [key] - Tambahkan API key baru
${prefix}removekey [service] [key] - Hapus API key
${prefix}listkeys - Tampilkan daftar API keys

*💬 Messaging:*
${prefix}say [phone] [text] - Kirim pesan sebagai Veo ke nomor tertentu`;
            message.reply(adminMenu);
          } else {
            const userMenu = `*✨ Veo AI Assistant ✨*

Veo adalah asisten AI Gen-Z yang cerdas dan seru by Vallian! 🌟

*Available Commands:*
Di chat pribadi - Kirim pesan langsung untuk bertanya apa saja 💬
Di grup - ${prefix}a [text/image/video] untuk bertanya atau analisis gambar/video 📸 🎬
${prefix}g [prompt] - Membuat gambar dengan AI 🎨
${prefix}ge [prompt] - Mengedit gambar dengan AI (kirim gambar) 🖌️
${prefix}help/menu - Tampilkan menu bantuan ini 📃

*Chat Management:* (hanya di chat pribadi / private chat)
${prefix}clear/reset - Hapus seluruh riwayat chat kamu (chat + images + videos)
${prefix}clearg - Hapus riwayat image generation kamu saja`;
            message.reply(userMenu);
          }
          break;
        case "addkey":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            if (args.length < 2) {
              return message.reply(`Format: ${prefix}addkey [service] [apikey]`);
            }
            
            const serviceName = args[0].toLowerCase();
            const apiKey = args[1];
            
            if (apiKeyPool.addKey(serviceName, apiKey)) {
              message.reply(`✅ API key added successfully for ${serviceName}`);
            } else {
              message.reply(`❌ API key already exists for ${serviceName}`);
            }
          } catch (error) {
            console.error("Error adding API key:", error);
            message.reply("❌ Error while adding API key.");
          }
          break;
        case "removekey":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            if (args.length < 2) {
              return message.reply(`Format: ${prefix}removekey [service] [apikey]`);
            }
            
            const serviceName = args[0].toLowerCase();
            const apiKey = args[1];
            
            if (apiKeyPool.removeKey(serviceName, apiKey)) {
              message.reply(`✅ API key removed successfully from ${serviceName}`);
            } else {
              message.reply(`❌ API key not found for ${serviceName}`);
            }
          } catch (error) {
            console.error("Error removing API key:", error);
            message.reply("❌ Error while removing API key.");
          }
          break;
        case "listkeys":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            const allKeys = apiKeyPool.getAllKeys();
            let keyReport = "*API Key Summary*\n\n";
            
            for (const [service, keys] of Object.entries(allKeys)) {
              keyReport += `- ${service}: ${keys.length} key(s)\n`;
            }
            
            message.reply(keyReport);
          } catch (error) {
            console.error("Error listing API keys:", error);
            message.reply("❌ Error while retrieving API keys.");
          }
          break;
        case "status":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            // Send initial message
            const waitingMsg = await message.reply("🔍 Generating system status report... Please wait...");
            const waitingMsgKey = waitingMsg.key;
            
            // Create status report
            let statusReport = "*🤖 VEO SYSTEM STATUS REPORT*\n\n";
            
            // WhatsApp connection status
            statusReport += "*📱 WhatsApp Connection:*\n";
            statusReport += `- Status: ✅ Connected\n`;
            statusReport += `- Bot Number: ${sock.user.id}\n`;
            statusReport += `- Admin Number: ${CONFIG.ADMIN_NUMBER}\n\n`;
            
            // API Key Status
            const allKeys = apiKeyPool.getAllKeys();
            statusReport += "*🔑 API Keys Status:*\n";
            
            for (const [service, keys] of Object.entries(allKeys)) {
              statusReport += `- ${service}: ${keys.length} key(s)\n`;
            }
            statusReport += "\n";
            
            // Load system configuration
            statusReport += "*⚙️ System Configuration:*\n";
            statusReport += `- Max Retries: ${CONFIG.SYSTEM.MAX_RETRIES}\n`;
            statusReport += `- Max Context Images: ${CONFIG.SYSTEM.MAX_CONTEXT_IMAGES}\n`;
            statusReport += `- Max Context Videos: ${CONFIG.SYSTEM.MAX_CONTEXT_VIDEOS}\n`;
            statusReport += `- Max Video Size: ${CONFIG.SYSTEM.MAX_VIDEO_SIZE_MB}MB\n\n`;
            
            // Memory usage
            const memoryUsage = process.memoryUsage();
            statusReport += "*💾 Memory Usage:*\n";
            statusReport += `- Total Memory: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB (All memory allocated)\n`;
            statusReport += `- JS Memory Allocated: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB (Available for JS)\n`;
            statusReport += `- JS Memory Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB (Currently used by JS)\n`;
            statusReport += `- C++ Objects: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB (Used by C++ objects)\n\n`;
            
            // System uptime
            const uptime = process.uptime();
            const days = Math.floor(uptime / (3600 * 24));
            const hours = Math.floor((uptime % (3600 * 24)) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            
            statusReport += "*⏱️ Uptime:*\n";
            statusReport += `- ${days}d ${hours}h ${minutes}m ${seconds}s\n\n`;
            
            // Add filesystem stats
            statusReport += "*📁 Storage Status:*\n";
            
            // Check history directory
            const HISTORY_DIR = path.join(process.cwd(), 'history');
            let totalUsers = 0;
            let totalChats = 0;
            let totalImageGenChats = 0;
            let totalVideoGenChats = 0;
            
            if (fs.existsSync(HISTORY_DIR)) {
              const users = fs.readdirSync(HISTORY_DIR);
              totalUsers = users.length;
              
              // Count chat histories and image gen histories
              for (const user of users) {
                const userDir = path.join(HISTORY_DIR, user);
                if (fs.statSync(userDir).isDirectory()) {
                  const chatHistoryFile = path.join(userDir, 'chat_history.json');
                  if (fs.existsSync(chatHistoryFile)) {
                    totalChats++;
                  }
                  
                  const imageGenDir = path.join(userDir, 'image_gen');
                  if (fs.existsSync(imageGenDir) && fs.statSync(imageGenDir).isDirectory()) {
                    const imageGenHistoryFile = path.join(imageGenDir, 'chat_history.json');
                    if (fs.existsSync(imageGenHistoryFile)) {
                      totalImageGenChats++;
                    }
                  }
                  
                  const videoGenDir = path.join(userDir, 'video_gen');
                  if (fs.existsSync(videoGenDir) && fs.statSync(videoGenDir).isDirectory()) {
                    const videoGenHistoryFile = path.join(videoGenDir, 'chat_history.json');
                    if (fs.existsSync(videoGenHistoryFile)) {
                      totalVideoGenChats++;
                    }
                  }
                }
              }
            }
            
            statusReport += `- Total Users: ${totalUsers}\n`;
            statusReport += `- Chat Histories: ${totalChats}\n`;
            statusReport += `- Image Gen Histories: ${totalImageGenChats}\n`;
            statusReport += `- Video Gen Histories: ${totalVideoGenChats}\n`;
            
            // Check disk space for history dir
            try {
              let historyDirSize = 0;
              const calculateDirSize = (dirPath) => {
                const items = fs.readdirSync(dirPath);
                for (const item of items) {
                  const itemPath = path.join(dirPath, item);
                  const stats = fs.statSync(itemPath);
                  if (stats.isDirectory()) {
                    calculateDirSize(itemPath);
                  } else {
                    historyDirSize += stats.size;
                  }
                }
              };
              
              if (fs.existsSync(HISTORY_DIR)) {
                calculateDirSize(HISTORY_DIR);
                statusReport += `- History Storage: ${(historyDirSize / (1024 * 1024)).toFixed(2)} MB\n`;
              }
            } catch (error) {
              statusReport += `- History Storage: Error calculating size\n`;
            }
            
            statusReport += "\n";
            
            // Test models connectivity section
            statusReport += "*🧪 AI Models Connectivity:*\n";
            
            // Initialize model test results - don't send test message yet
            let chatModelStatus = "⏳ Testing...";
            let imageModelStatus = "⏳ Testing...";
            let videoModelStatus = "⏳ Testing...";
            
            // Create the Gemini API client with correct key name
            const genAI = new GoogleGenerativeAI(apiKeyPool.getKey("keygemini"));
            
            // Test chat model with simple "hi" message exactly like normal chat
            try {
              const model = genAI.getGenerativeModel({ 
                model: CONFIG.AI_MODELS.CHAT,
                safetySettings: CONFIG.SAFETY_SETTINGS.CHAT
              });
              
              // Simple text-only test with "hi"
              const parts = [{ text: "hi" }];
              const result = await model.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig: {
                  responseModalities: ["TEXT"],
                  temperature: 1,
                  topP: 0.95,
                  maxOutputTokens: 4096,
                  candidateCount: 1,
                  stopSequences: []
                },
                safetySettings: CONFIG.SAFETY_SETTINGS.CHAT
              });
              
              const response = await result.response;
              const text = response.text();
              chatModelStatus = `✅ Working`;
            } catch (error) {
              chatModelStatus = `❌ Error`;
              // Log detailed error to console
              console.error(chalk.red(`Status check - Chat Model Error: ${error.message}`));
            }
            
            // Test image model with simple "hi" message like normal image gen
            try {
              const imageModel = genAI.getGenerativeModel({ 
                model: CONFIG.AI_MODELS.IMAGE_GENERATION,
                safetySettings: CONFIG.SAFETY_SETTINGS.IMAGE_GENERATION
              });
              
              // Test with "make white image" prompt
              const parts = [{ text: "make white image" }];
              const result = await imageModel.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig: {
                  responseModalities: ["image", "text"],
                  responseMimeType: "text/plain",
                  temperature: 1,
                  topP: 0.95,
                  maxOutputTokens: 4096,
                  candidateCount: 1
                },
                safetySettings: CONFIG.SAFETY_SETTINGS.IMAGE_GENERATION
              });
              
              const response = await result.response;
              
              // Find the image part in the response
              let imagePart = null;
              
              // Search for the image in various response structures
              if (response.candidates && response.candidates[0]) {
                const candidate = response.candidates[0];
                
                if (candidate.content && candidate.content.parts) {
                  for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                      imagePart = part.inlineData;
                      break;
                    }
                  }
                } else if (candidate.parts) {
                  for (const part of candidate.parts) {
                    if (part.inlineData) {
                      imagePart = part.inlineData;
                      break;
                    }
                  }
                }
              }
              
              if (imagePart) {
                // Got image - temporarily save it
                const tempDir = path.join(process.cwd(), 'temp');
                ensureDirectoryExists(tempDir);
                
                const tempImagePath = path.join(tempDir, 'status_test_image.jpg');
                const imageBuffer = Buffer.from(imagePart.data, 'base64');
                fs.writeFileSync(tempImagePath, imageBuffer);
                
                // Delete the temporary image
                if (fs.existsSync(tempImagePath)) {
                  fs.unlinkSync(tempImagePath);
                }
                
                imageModelStatus = "✅ Working";
              } else {
                // No image found in response
                imageModelStatus = "❌ Error";
                console.error(chalk.red("Status check - Image Model Error: No image found in response"));
              }
            } catch (error) {
              imageModelStatus = `❌ Error`;
              // Log detailed error to console
              console.error(chalk.red(`Status check - Image Model Error: ${error.message}`));
            }
            
            // Test video model with simple "hi" message like normal video gen
            try {
              const videoModel = genAI.getGenerativeModel({ 
                model: CONFIG.AI_MODELS.IMAGE_GENERATION,
                safetySettings: CONFIG.SAFETY_SETTINGS.IMAGE_GENERATION
              });
              
              // Test with "make white video" prompt
              const parts = [{ text: "make white video" }];
              const result = await videoModel.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig: {
                  responseModalities: ["video", "text"],
                  responseMimeType: "text/plain",
                  temperature: 1,
                  topP: 0.95,
                  maxOutputTokens: 4096,
                  candidateCount: 1
                },
                safetySettings: CONFIG.SAFETY_SETTINGS.IMAGE_GENERATION
              });
              
              const response = await result.response;
              
              // Find the video part in the response
              let videoPart = null;
              
              // Search for the video in various response structures
              if (response.candidates && response.candidates[0]) {
                const candidate = response.candidates[0];
                
                if (candidate.content && candidate.content.parts) {
                  for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                      videoPart = part.inlineData;
                      break;
                    }
                  }
                } else if (candidate.parts) {
                  for (const part of candidate.parts) {
                    if (part.inlineData) {
                      videoPart = part.inlineData;
                      break;
                    }
                  }
                }
              }
              
              if (videoPart) {
                // Got video - temporarily save it
                const tempDir = path.join(process.cwd(), 'temp');
                ensureDirectoryExists(tempDir);
                
                const tempVideoPath = path.join(tempDir, 'status_test_video.mp4');
                const videoBuffer = Buffer.from(videoPart.data, 'base64');
                fs.writeFileSync(tempVideoPath, videoBuffer);
                
                // Delete the temporary video
                if (fs.existsSync(tempVideoPath)) {
                  fs.unlinkSync(tempVideoPath);
                }
                
                videoModelStatus = "✅ Working";
              } else {
                // No video found in response
                videoModelStatus = "❌ Error";
                console.error(chalk.red("Status check - Video Model Error: No video found in response"));
              }
            } catch (error) {
              videoModelStatus = `❌ Error`;
              // Log detailed error to console
              console.error(chalk.red(`Status check - Video Model Error: ${error.message}`));
            }
            
            // Update the status report with the test results
            statusReport += `- Chat Model: ${chatModelStatus}\n`;
            statusReport += `- Image Model: ${imageModelStatus}\n`;
            statusReport += `- Video Model: ${videoModelStatus}\n\n`;
            
            // Send the complete status report
            await message.reply(statusReport);
            
            // Delete the initial waiting message
            await sock.sendMessage(message.chat, { delete: waitingMsgKey });
          } catch (error) {
            console.error("Error generating status report:", error);
            message.reply("❌ Error while generating system status report.");
          }
          break;
        case "clear": case "reset":
          // Check if sender is admin or if it's a private chat (non-group)
          if (!isAdmin && message.isGroup) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            // Clear chat history json
            const chatSuccess = historyManager.clearMessageHistory(message.chat);
            
            // Clear image generation history
            const imageGenSuccess = historyManager.clearMessageHistory(message.chat, "image_gen");
            
            // Clear image edit history
            const imageEditSuccess = historyManager.clearMessageHistory(message.chat, "image_edit");
            
            // Clear video generation history
            const videoGenSuccess = historyManager.clearMessageHistory(message.chat, "video_gen");
            
            // Clear images directories
            const userDir = historyManager.getUserDirectory(message.chat);
            let imagesCleared = 0;
            
            // Clear regular chat images
            const chatImagesDir = path.join(userDir, 'images');
            if (fs.existsSync(chatImagesDir)) {
              const files = fs.readdirSync(chatImagesDir);
              for (const file of files) {
                fs.unlinkSync(path.join(chatImagesDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_CHAT_IMAGE_DIR.replace("{0}", chatImagesDir)));
            }
            
            // Clear voicenotes directory
            const voicenotesDir = path.join(userDir, 'voicenotes');
            if (fs.existsSync(voicenotesDir)) {
              const files = fs.readdirSync(voicenotesDir);
              for (const file of files) {
                fs.unlinkSync(path.join(voicenotesDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_VOICE_NOTES_DIR.replace("{0}", voicenotesDir)));
            }
            
            // Clear videos directory
            const videosDir = path.join(userDir, 'videos');
            if (fs.existsSync(videosDir)) {
              const files = fs.readdirSync(videosDir);
              for (const file of files) {
                fs.unlinkSync(path.join(videosDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_VIDEOS_DIR.replace("{0}", videosDir)));
            }
            
            // Clear image_gen directories
            const imageGenDir = historyManager.getUserDirectory(message.chat, "image_gen");
            const genGeneratedImagesDir = path.join(imageGenDir, 'generated');
            const genUploadedImagesDir = path.join(imageGenDir, 'uploads');
            
            if (fs.existsSync(genGeneratedImagesDir)) {
              const files = fs.readdirSync(genGeneratedImagesDir);
              for (const file of files) {
                fs.unlinkSync(path.join(genGeneratedImagesDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_GENERATED_IMAGE_DIR.replace("{0}", genGeneratedImagesDir)));
            }
            
            if (fs.existsSync(genUploadedImagesDir)) {
              const files = fs.readdirSync(genUploadedImagesDir);
              for (const file of files) {
                fs.unlinkSync(path.join(genUploadedImagesDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_UPLOADED_IMAGES_DIR.replace("{0}", genUploadedImagesDir)));
            }
            
            // Clear image_edit directories
            const imageEditDir = historyManager.getUserDirectory(message.chat, "image_edit");
            const editGeneratedImagesDir = path.join(imageEditDir, 'generated');
            const editUploadedImagesDir = path.join(imageEditDir, 'uploads');
            
            if (fs.existsSync(editGeneratedImagesDir)) {
              const files = fs.readdirSync(editGeneratedImagesDir);
              for (const file of files) {
                fs.unlinkSync(path.join(editGeneratedImagesDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_GENERATED_IMAGE_DIR.replace("{0}", editGeneratedImagesDir)));
            }
            
            if (fs.existsSync(editUploadedImagesDir)) {
              const files = fs.readdirSync(editUploadedImagesDir);
              for (const file of files) {
                fs.unlinkSync(path.join(editUploadedImagesDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_UPLOADED_IMAGES_DIR.replace("{0}", editUploadedImagesDir)));
            }
            
            // Clear video_gen directories
            const videoGenDir = historyManager.getUserDirectory(message.chat, "video_gen");
            const genGeneratedVideosDir = path.join(videoGenDir, 'generated');
            const genUploadedVideosDir = path.join(videoGenDir, 'uploads');
            
            if (fs.existsSync(genGeneratedVideosDir)) {
              const files = fs.readdirSync(genGeneratedVideosDir);
              for (const file of files) {
                fs.unlinkSync(path.join(genGeneratedVideosDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_GENERATED_IMAGE_DIR.replace("{0}", genGeneratedVideosDir)));
            }
            
            if (fs.existsSync(genUploadedVideosDir)) {
              const files = fs.readdirSync(genUploadedVideosDir);
              for (const file of files) {
                fs.unlinkSync(path.join(genUploadedVideosDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_UPLOADED_IMAGES_DIR.replace("{0}", genUploadedVideosDir)));
            }
            
            if (chatSuccess || imageGenSuccess || imageEditSuccess || videoGenSuccess) {
              message.reply(`✅ Cleared: ${chatSuccess ? 'Chat history' : ''}${chatSuccess && (imageGenSuccess || imageEditSuccess || videoGenSuccess) ? ' and ' : ''}${(imageGenSuccess || imageEditSuccess || videoGenSuccess) ? 'Image history' : ''}${imagesCleared === 1 ? ' (1 thing removed)' : imagesCleared > 1 ? ` (${imagesCleared} things removed)` : ''}`);
            } else {
              message.reply("❌ No history found to clear.");
            }
          } catch (error) {
            console.error("Error clearing history:", error);
            message.reply("❌ Error while clearing chat history.");
          }
          break;
        case "clearg":
          // Check if sender is admin or if it's a private chat (non-group)
          if (!isAdmin && message.isGroup) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            // Clear image generation history
            const imageGenSuccess = historyManager.clearMessageHistory(message.chat, "image_gen");
            
            // Clear image edit history
            const imageEditSuccess = historyManager.clearMessageHistory(message.chat, "image_edit");
            
            // Clear generated images directory for image_gen
            const imageGenDir = historyManager.getUserDirectory(message.chat, "image_gen");
            const genGeneratedImagesDir = path.join(imageGenDir, 'generated');
            const genUploadedImagesDir = path.join(imageGenDir, 'uploads');
            
            // Clear generated images directory for image_edit
            const imageEditDir = historyManager.getUserDirectory(message.chat, "image_edit");
            const editGeneratedImagesDir = path.join(imageEditDir, 'generated');
            const editUploadedImagesDir = path.join(imageEditDir, 'uploads');
            
            let imagesCleared = 0;
            
            // Clear generated images from image_gen
            if (fs.existsSync(genGeneratedImagesDir)) {
              const files = fs.readdirSync(genGeneratedImagesDir);
              for (const file of files) {
                fs.unlinkSync(path.join(genGeneratedImagesDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_GENERATED_IMAGE_DIR.replace("{0}", genGeneratedImagesDir)));
            }
            
            // Clear uploaded images from image_gen
            if (fs.existsSync(genUploadedImagesDir)) {
              const files = fs.readdirSync(genUploadedImagesDir);
              for (const file of files) {
                fs.unlinkSync(path.join(genUploadedImagesDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_UPLOADED_IMAGES_DIR.replace("{0}", genUploadedImagesDir)));
            }
            
            // Clear generated images from image_edit
            if (fs.existsSync(editGeneratedImagesDir)) {
              const files = fs.readdirSync(editGeneratedImagesDir);
              for (const file of files) {
                fs.unlinkSync(path.join(editGeneratedImagesDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_GENERATED_IMAGE_DIR.replace("{0}", editGeneratedImagesDir)));
            }
            
            // Clear uploaded images from image_edit
            if (fs.existsSync(editUploadedImagesDir)) {
              const files = fs.readdirSync(editUploadedImagesDir);
              for (const file of files) {
                fs.unlinkSync(path.join(editUploadedImagesDir, file));
                imagesCleared++;
              }
              console.log(chalk.green(CONFIG.CONSOLE.CLEARED_UPLOADED_IMAGES_DIR.replace("{0}", editUploadedImagesDir)));
            }
            
            if (imageGenSuccess || imageEditSuccess || imagesCleared > 0) {
              message.reply(`✅ Cleared image history${imagesCleared === 1 ? ' (1 file removed)' : imagesCleared > 1 ? ` (${imagesCleared} files removed)` : ''}`);
            } else {
              message.reply("❌ No image history found to clear.");
            }
          } catch (error) {
            console.error("Error clearing image history:", error);
            message.reply("❌ Error while clearing image history.");
          }
          break;
        case "a": case "gemini": case "ai":
          try {
            // Check if there's no prompt text in a group chat
            if (message.isGroup && (!text || text.trim() === '')) {
              return message.reply("Veo: Gunakan /a + pesanmu, untuk chat!");
            }
            
            // Check if command was explicitly used in private chat and provide tip
            // Use original message text (budy) to check if they actually typed the /a prefix
            if (!message.isGroup && budy.startsWith(prefix + "a")) {
              // We'll still process their message, but also send a tip
              setTimeout(async () => {
                await message.reply("Quick tip: Kamu tidak perlu menggunakan /a di chat private! Itu hanya untuk Group.");
              }, 2000); // Delay the tip slightly so it appears after the response
            }
            
            // Check for media in the message
            const messageType = getContentType(message.message);
            const hasImage = messageType === 'imageMessage';
            const hasVideo = messageType === 'videoMessage';
            const hasQuotedImage = message.quoted && getContentType(message.quoted.message) === 'imageMessage';
            const hasQuotedVideo = message.quoted && getContentType(message.quoted.message) === 'videoMessage';
            // Check if there's a quoted message that's not an image or video
            const hasQuotedText = message.quoted && !hasQuotedImage && !hasQuotedVideo;
            
            // Extract quoted message text if it exists
            let quotedMessageText = "";
            if (hasQuotedText) {
              const quotedMsgType = getContentType(message.quoted.message);
              if (quotedMsgType === 'conversation' || quotedMsgType === 'extendedTextMessage') {
                // Extract the text content based on the message type
                quotedMessageText = quotedMsgType === 'conversation' 
                  ? message.quoted.message.conversation 
                  : message.quoted.message.extendedTextMessage.text;
                console.log(chalk.green(`User quoted message: ${quotedMessageText}`));
              }
            }
            
            // Send appropriate waiting message based on content type
            const thinkingMsg = await message.reply(
              hasVideo || hasQuotedVideo ? CONFIG.MESSAGES.ANALYZING_VIDEO :
              hasImage || hasQuotedImage ? CONFIG.MESSAGES.ANALYZING_IMAGE : 
              CONFIG.MESSAGES.THINKING
            );
            let thinkingMsgKey = thinkingMsg.key;
            
            // Add gear emoji reaction to the user's message to indicate processing
            try {
              await sock.sendMessage(message.chat, {
                react: {
                  text: "⚙️", // Gear emoji
                  key: message.key
                }
              });
            } catch (reactError) {
              console.error("Error adding gear reaction:", reactError);
              // Continue processing even if reaction fails
            }
            
            // Prepare data for retry mechanism
            let userMessageForHistory = "";
            let parts = [];
            let imageReference = "";
            let videoReference = "";
            let isRetrying = false;
            let retryCount = 0;
            const MAX_RETRIES = CONFIG.SYSTEM.MAX_RETRIES; // Maximum number of API keys to try
              let errorMessages = [];
              let isVideoProcessingErrorSent = false; // Flag to track if video processing error was already sent
              
              // Get chat history outside function scope so it's accessible to both functions
            const chatHistory = historyManager.getMessageHistory(message.chat);
            
            // Extract recent messages (last 60)
            const recentMessages = chatHistory.slice(-60);
            
            // Set safety settings to BLOCK_NONE for all categories
            const safetySettings = CONFIG.SAFETY_SETTINGS.CHAT;
            
            // Process user input and prepare API request
            const prepareRequest = async () => {
              // Get API key from the pool
              const geminiApiKey = apiKeyPool.getKey("keygemini");
              
              if (!geminiApiKey) {
                throw new Error("No API key available for Google Gemini");
              }
              
              if (!text && !hasImage && !hasQuotedImage && !hasVideo && !hasQuotedVideo) {
                throw new Error("No content provided");
              }
              
              // Initialize Gemini AI with the selected API key
              const genAI = new GoogleGenerativeAI(geminiApiKey);
              
              // Reset parts array for each retry
              parts = [];
            
            // Process image if present
            if (hasImage || hasQuotedImage) {
              try {
                console.log(chalk.green(CONFIG.CONSOLE.PROCESSING_IMAGE));
                // Get the message that contains the image
                const imgMsg = hasQuotedImage ? message.quoted : message;
                
                // Download the media as buffer
                const buffer = await downloadMediaMessage(
                  imgMsg,
                  'buffer',
                  {},
                  { 
                    logger: console,
                    // For reupload if needed
                    reuploadRequest: sock.updateMediaMessage
                  }
                );
                
                // Get mimetype
                const mimetype = hasQuotedImage 
                  ? message.quoted.message.imageMessage.mimetype 
                  : message.message.imageMessage.mimetype;
                
                console.log(chalk.green(CONFIG.CONSOLE.IMAGE_DOWNLOADED));
                
                // Save image to file and get reference (includes compression)
                const imageInfo = await saveImageToFile(buffer, message.chat, mimetype);
                imageReference = `[IMAGE ATTACHED:${imageInfo.id}]`;
                
                // Add compressed image to parts array for Gemini API
                parts.push({
                  inlineData: {
                    data: imageInfo.buffer.toString('base64'),
                    mimeType: imageInfo.mimetype
                  }
                });
                
                // If there's no text, use a default prompt
                if (!text) {
                  text = "Describe what you see in this image.";
                }
                
                console.log(chalk.green(CONFIG.CONSOLE.IMAGE_PROCESSED.replace("{0}", imageReference)));
              } catch (error) {
                console.error(chalk.red(CONFIG.CONSOLE.ERROR_PROCESSING_IMAGE.replace("{0}", error.message)));
                  throw new Error("Failed to process image: " + error.message);
              }
            }
            
            // Process video if present
            if (hasVideo || hasQuotedVideo) {
              try {
                console.log(chalk.green(CONFIG.CONSOLE.PROCESSING_VIDEO));
                // Get the message that contains the video
                const videoMsg = hasQuotedVideo ? message.quoted : message;
                
                // Download the media as buffer
                const buffer = await downloadMediaMessage(
                  videoMsg,
                  'buffer',
                  {},
                  { 
                    logger: console,
                    // For reupload if needed
                    reuploadRequest: sock.updateMediaMessage
                  }
                );
                
                // Get mimetype
                const mimetype = hasQuotedVideo 
                  ? message.quoted.message.videoMessage.mimetype 
                  : message.message.videoMessage.mimetype;
                
                console.log(chalk.green(CONFIG.CONSOLE.VIDEO_DOWNLOADED));
                
                // Save video to file and get reference
                const videoInfo = await saveVideoToFile(buffer, message.chat, mimetype);
                videoReference = `[VIDEO ATTACHED:${videoInfo.id}]`;
                
                // Add video to parts array for Gemini API
                parts.push({
                  inlineData: {
                    data: videoInfo.buffer.toString('base64'),
                    mimeType: videoInfo.mimetype
                  }
                });
                
                // If there's no text, use a default prompt
                if (!text) {
                  text = "Analyze this video and describe what you see.";
                }
                
                console.log(chalk.green(`Video processed successfully, reference: ${videoReference}`));
              } catch (error) {
                console.error(chalk.red(CONFIG.CONSOLE.ERROR_PROCESSING_VIDEO.replace("{0}", error.message)));
                
                // Send specific error message for video size issues, but only once
                if (error.message.includes("size exceeds")) {
                  if (!isVideoProcessingErrorSent) {
                    await message.reply(CONFIG.MESSAGES.VIDEO_PROCESSING_ERROR);
                    isVideoProcessingErrorSent = true;
                  }
                }
                
                // Always throw the error to be handled by the retry mechanism or final error handler.
                // This ensures that the overall operation failure is still processed.
                throw error; 
              }
            }
            
            // Add text part
            // Include user's name in the query for better context, especially in groups
            const userNamePrefix = pushname ? `${pushname}: ` : "";
            parts.push({ text: userNamePrefix + text });
            
            // Save user message to history (include image/video reference if present)
            // Save the original message to history (without name prefix) with references if any
            if (imageReference && videoReference) {
              userMessageForHistory = `${imageReference} ${videoReference} ${q}`;
            } else if (imageReference) {
              userMessageForHistory = `${imageReference} ${q}`;
            } else if (videoReference) {
              userMessageForHistory = `${videoReference} ${q}`;
            } else {
              userMessageForHistory = q;
            }
            
            // Only save to history on first attempt, not on retries
            if (!isRetrying) {
            historyManager.saveMessageToHistory(message, 'user', userMessageForHistory);
              }
            
            // Get previous chat context and process for images and videos
            let contextParts = [];
            
            if (recentMessages.length > 0) {
              // Process each message to extract and load referenced images and videos
              const historyWithMedia = [];
              
              // Add all previous images and videos first
              let videoCount = 0;
              let imageCount = 0;
              const maxContextVideos = CONFIG.SYSTEM.MAX_CONTEXT_VIDEOS;
              const maxContextImages = CONFIG.SYSTEM.MAX_CONTEXT_IMAGES;
              
              for (const msg of recentMessages) {
                // Skip the current message we just added
                if (msg.content === userMessageForHistory && msg.role === 'user') continue;
                
                // Check if message contains video reference
                if (msg.content.includes('[VIDEO ATTACHED:')) {
                  // If we already have max videos, skip adding more
                  if (videoCount >= maxContextVideos) {
                    historyWithMedia.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.replace(/\[VIDEO ATTACHED:[0-9]+\]/, '[Video - not included due to context limit]')}`);
                    continue;
                  }
                  
                  // Extract video reference
                  const match = /\[VIDEO ATTACHED:([0-9]+)\]/.exec(msg.content);
                  if (match && match[1]) {
                    const videoId = match[1];
                    console.log(chalk.green(CONFIG.CONSOLE.HISTORICAL_VIDEO_LOADING.replace("{0}", videoId).replace("{1}", msg.sender)));
                    
                    // Try to load the video from storage
                    const videoData = loadVideoAsBase64(`VIDEO ATTACHED:${videoId}`, message.chat);
                    
                    if (videoData) {
                      console.log(chalk.green(CONFIG.CONSOLE.HISTORICAL_VIDEO_LOADED.replace("{0}", videoId)));
                      // Add video to context parts
                      contextParts.push({
                        inlineData: {
                          data: videoData.data,
                          mimeType: videoData.mimeType
                        }
                      });
                      videoCount++;
                      
                      // Add formatted message with video placeholder
                      historyWithMedia.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: [Video] ${msg.content.replace(/\[VIDEO ATTACHED:[0-9]+\]\s*/, '')}`);
                    } else {
                      console.error(chalk.red(CONFIG.CONSOLE.HISTORICAL_VIDEO_LOAD_FAILED.replace("{0}", videoId)));
                      // Video not found, just add text with note
                      historyWithMedia.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.replace(/\[VIDEO ATTACHED:[0-9]+\]/, '[Video]')}`);
                    }
                  } else {
                    // No valid video ID found
                    historyWithMedia.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`);
                  }
                } 
                // Check if message contains image reference
                else if (msg.content.includes('[IMAGE ATTACHED:')) {
                  // If we already have max images, skip adding more
                  if (imageCount >= maxContextImages) {
                    historyWithMedia.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.replace(/\[IMAGE ATTACHED:[0-9]+\]/, '[Image - not included due to context limit]')}`);
                    continue;
                  }
                  
                  // Extract image reference
                  const match = /\[IMAGE ATTACHED:([0-9]+)\]/.exec(msg.content);
                  if (match && match[1]) {
                    const imageId = match[1];
                    console.log(chalk.green(CONFIG.CONSOLE.HISTORICAL_IMAGE_LOADING.replace("{0}", imageId).replace("{1}", msg.sender)));
                    
                    // Try to load the image from storage
                    // Use message.chat instead of msg.sender for group chats to ensure image is loaded from group folder
                    const imageData = loadImageAsBase64(`IMAGE ATTACHED:${imageId}`, message.chat);
                    
                    if (imageData) {
                      console.log(chalk.green(CONFIG.CONSOLE.HISTORICAL_IMAGE_LOADED.replace("{0}", imageId)));
                      // Add image to context parts
                      contextParts.push({
                        inlineData: {
                          data: imageData.data,
                          mimeType: imageData.mimeType
                        }
                      });
                      imageCount++;
                      
                      // Add formatted message with image placeholder
                      historyWithMedia.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: [Image] ${msg.content.replace(/\[IMAGE ATTACHED:[0-9]+\]\s*/, '')}`);
                    } else {
                      console.error(chalk.red(CONFIG.CONSOLE.HISTORICAL_IMAGE_LOAD_FAILED.replace("{0}", imageId)));
                      // Image not found, just add text with note
                      historyWithMedia.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.replace(/\[IMAGE ATTACHED:[0-9]+\]/, '[Image]')}`);
                    }
                  } else {
                    // No valid image ID found
                    historyWithMedia.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`);
                  }
                } else {
                  // Regular message without media
                  historyWithMedia.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`);
                }
              }
              
              // Log media context stats
              if (imageCount > 0 || videoCount > 0) {
                const hasCurrentImage = hasImage || hasQuotedImage;
                const hasCurrentVideo = hasVideo || hasQuotedVideo;
                console.log(chalk.green(CONFIG.CONSOLE.CONTEXT_IMAGES_ADDED.replace("{0}", imageCount).replace("{1}", hasCurrentImage ? "yes" : "no")));
                console.log(chalk.green(CONFIG.CONSOLE.CONTEXT_VIDEOS_ADDED.replace("{0}", videoCount).replace("{1}", hasCurrentVideo ? "yes" : "no")));
              }
              
              // Create context text with proper history
              const contextPrompt = `Previous conversation:\n${historyWithMedia.join('\n')}\n\n${pushname}'s new message: ${text}`;
              
              // Add context as a text part
              contextParts.push({ text: contextPrompt });
            } else {
              // No history, just add current text
              contextParts.push({ text });
            }
            
            // Merge the context parts with our current parts
            // Current image/video always comes first if present
            const allParts = [...parts];
            
            // If we have media history, add them before text but after current media
            if (contextParts.length > 1) {
              // First part is current media (if exists), followed by historical media, then text at the end
              // If we have an image or video in current parts, keep it first
              if (parts.length > 1) {
                // Keep current media as first part(s)
                allParts.pop(); // Remove text part
                // Add all context parts (images + videos + text)
                allParts.push(...contextParts);
              } else {
                // No current media, so use all context parts as is
                allParts.splice(0, allParts.length, ...contextParts);
              }
            }
            
              console.log(chalk.green(CONFIG.CONSOLE.API_ATTEMPT.replace("{0}", retryCount + 1)));
            
            const model = genAI.getGenerativeModel({ 
              model: CONFIG.AI_MODELS.CHAT,
              systemInstruction: {
                parts: [{ text: loadSystemPrompt() }],
                role: "system"
              },
                safetySettings: safetySettings,
              tools: [{
                googleSearch: {}
              }]
            });
              
              // Return model and parts to use for the API call
              return { model, allParts };
            };
            
            // Execute the API call with retry logic
            const executeWithRetry = async () => {
              while (retryCount < MAX_RETRIES) {
                try {
                  const { model, allParts } = await prepareRequest();
                  
                  // Create contents array for chat history
                  const contents = [];
                  
                  // Add messages from history with proper roles for Gemini API
                  if (recentMessages && recentMessages.length > 0) {
                    for (const msg of recentMessages) {
                      // Skip the current user message we just added to history
                      if (msg.content === userMessageForHistory && msg.role === 'user') continue;
                      
                      // Convert 'assistant' role to 'model' for Gemini API
                      const geminiRole = msg.role === 'assistant' ? 'model' : msg.role;
                      
                      // Add message with proper role
                      contents.push({
                        role: geminiRole,
                        parts: [{ text: msg.content }]
                      });
                    }
                  }
                  
                  // If there's a quoted message, add it right before the current user message
                  // This helps provide context for what the user is replying to
                  if (quotedMessageText) {
                    contents.push({
                      role: "user",
                      parts: [{ text: `${pushname} quoted this message: "${quotedMessageText}"` }]
                    });
                  }
                  
                  // Add current user message with parts (may include images)
                  contents.push({
                    role: "user",
                    parts: allParts
                  });
                  
                  console.log(chalk.green(CONFIG.CONSOLE.SENDING_TO_GEMINI.replace("{0}", contents.length)));
            
                  const result = await model.generateContentStream({
                    contents: contents,
                    generationConfig: {
                      responseModalities: ["TEXT"],
                      temperature: 1,
                      topP: 0.95,
                      maxOutputTokens: 4096,
                      candidateCount: 1,
                      stopSequences: []
                    },
                    safetySettings: CONFIG.SAFETY_SETTINGS.CHAT
                  });
            
                  console.log(chalk.green(CONFIG.CONSOLE.RECEIVED_GEMINI_RESPONSE));
                  
                  let responseText = "";
                  let lastEditTime = 0;
                  const editInterval = 1000; // Edit message at most every 1 second
                  let currentThinkingMessage = thinkingMsgKey; // Store the key of the message to be edited

                  for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    if (chunkText) {
                      responseText += chunkText;
                      const currentTime = Date.now();
                      if (currentTime - lastEditTime > editInterval) {
                        try {
                          // Add ellipsis to indicate streaming
                          const streamingText = responseText + (result.stream.done ? "" : "..."); 
                          await sock.sendMessage(message.chat, {
                            text: streamingText,
                            edit: currentThinkingMessage,
                          });
                          lastEditTime = currentTime;
                        } catch (editError) {
                           // Log error but continue streaming if possible
                          console.error(chalk.yellow("Error editing message during stream:", editError.message));
                          // If editing fails (e.g. message deleted by user), we might need to send a new message
                          // For now, we'll just log and continue, the final message will still be sent.
                        }
                      }
                    }
                  }
                  
                  // Log the full raw output from Gemini API (this will be the aggregated response)
                  // console.log(chalk.blue("===== RAW GEMINI API OUTPUT START ====="));
                  // console.log(JSON.stringify(responseText, null, 2)); // responseText is now the full string
                  // console.log(chalk.blue("===== RAW GEMINI API OUTPUT END ====="));
                  
                  // Save AI response to history
                  const assistantMessage = {
                    chat: message.chat,
                    botNumber: botNumber,
                    pushName: "Veo"
                  };
                  historyManager.saveMessageToHistory(assistantMessage, 'assistant', responseText);
                  
                  // Send final edited message without ellipsis
                  try {
                      await sock.sendMessage(message.chat, {
                        text: responseText,
                        edit: currentThinkingMessage,
                      });
                  } catch (finalEditError) {
                      console.error(chalk.red("Error sending final edited message:", finalEditError.message));
                      // If final edit fails, send as a new reply
                      await message.reply(responseText);
                  }
                  
                  // Change reaction from gear to check mark to indicate completion
                  try {
                    await sock.sendMessage(message.chat, {
                      react: {
                        text: "✅", // Check emoji
                        key: message.key
                      }
                    });
                  } catch (reactError) {
                    console.error("Error changing reaction:", reactError);
                  }
                  
                  // Exit the retry loop on success
                  return true;
                } catch (error) {
                  retryCount++;
                  console.error(chalk.red(CONFIG.CONSOLE.RETRY_FAILED.replace("{0}", retryCount).replace("{1}", error.message || "Unknown error")));
                  errorMessages.push(error.message || "Unknown error");
                  
                  // If we've reached the limit, throw the error
                  if (retryCount >= MAX_RETRIES || retryCount >= apiKeyPool.getKeyCount("keygemini")) {
                    throw new Error("Maximum retry attempts reached");
                  }
                  
                  // Show retry message to user
                  isRetrying = true;
                  
                  // Update thinking message to show retry status
                  await sock.sendMessage(message.chat, { 
                    edit: thinkingMsgKey,
                    text: CONFIG.MESSAGES.RETRYING 
                  });
                  
                  // Short delay before retry
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            };
            
            // Start the execution with retry logic
            await executeWithRetry();
            
          } catch (error) {
            // Error handling - also delete thinking message on error
            try {
              // Try to delete the thinking message
              if (typeof thinkingMsgKey !== 'undefined') {
                await sock.sendMessage(message.chat, { delete: thinkingMsgKey });
              }
              
              // Change reaction to error symbol on failure
              try {
                await sock.sendMessage(message.chat, {
                  react: {
                    text: "❌", // Error emoji
                    key: message.key
                  }
                });
              } catch (reactError) {
                console.error("Error changing to error reaction:", reactError);
              }
            } catch (deleteError) {
              console.error("Error deleting thinking message:", deleteError);
            }
            
            // Log errors to console
            console.error(chalk.red(CONFIG.CONSOLE.FINAL_ERROR.replace("{0}", error.message)));
            console.error(chalk.red(CONFIG.CONSOLE.ERROR_MESSAGES.replace("{0}", errorMessages.join(', '))));
            
            // Show final error message to user
            message.reply(CONFIG.MESSAGES.ERROR_CONTACT_ADMIN);
          }
          break;
        case "g": case "img": case "image":
          // Show maintenance message and disable the command
          return message.reply(CONFIG.MESSAGES.IMAGE_GEN_MAINTENANCE);
          /*
          try {
            // Check for image in the message
            const messageType = getContentType(message.message);
            const hasImage = messageType === 'imageMessage';
            const hasQuotedImage = message.quoted && getContentType(message.quoted.message) === 'imageMessage';
            
            // For /g, we only want text-to-image generation (no image uploads)
            if (hasImage || hasQuotedImage) {
              return message.reply("⚠️ Untuk generate gambar baru gunakan `/g [prompt]` saja tanpa kirim gambar! Kalau mau edit gambar, gunakan `/ge [prompt]` dengan kirim gambar 🖼️");
            }
            
            // Check if user provided a prompt
            if (!text) {
              return message.reply("🤔 Hmm, kamu ingin generate gambar apa? Tulis deskripsinya setelah `/g`, misalnya: `/g kucing lucu warna pink`");
            }
            
            // Send waiting message based on whether an image is attached
            const thinkingMsg = await message.reply(CONFIG.MESSAGES.GENERATING_IMAGE);
            let thinkingMsgKey = thinkingMsg.key;
            
            // Add gear emoji reaction to the user's message to indicate processing
            try {
              await sock.sendMessage(message.chat, {
                react: {
                  text: "⚙️", // Gear emoji
                  key: message.key
                }
              });
            } catch (reactError) {
              console.error("Error adding gear reaction:", reactError);
              // Continue processing even if reaction fails
            }
            
            // Prepare data for retry mechanism
            let retryCount = 0;
            const MAX_RETRIES = CONFIG.SYSTEM.MAX_RETRIES; // Maximum number of API keys to try
            let errorMessages = [];
            let isRetrying = false;
            
            // Set safety settings with only supported categories for image generation
            const imgGenSafetySettings = CONFIG.SAFETY_SETTINGS.IMAGE_GENERATION;
            
            // Create separate directory for image generation history
            const userDir = historyManager.getUserDirectory(message.chat, "image_gen");
            const imagesDir = path.join(userDir, 'generated');
            ensureDirectoryExists(imagesDir);
            
            // Save user prompt to history
            if (!isRetrying) {
              historyManager.saveMessageToHistory(message, 'user', q, "image_gen");
            }
            
            // Process user input and prepare API request
            const prepareImageGenRequest = async () => {
              if (!text) {
                throw new Error("Please provide a description for image generation");
              }
              
              // Get API key from the pool
              const geminiApiKey = apiKeyPool.getKey("keygemini");
              
              if (!geminiApiKey) {
                throw new Error("No API key available for Google Gemini");
              }
              
              // Initialize Gemini AI with the selected API key
              const genAI = new GoogleGenerativeAI(geminiApiKey);
              
              console.log(chalk.green(CONFIG.CONSOLE.API_ATTEMPT.replace("{0}", retryCount + 1)));
              
              // Prepare parts for the API request
              let parts = [];
              
              // Use prompt directly without adding user's name
              const promptWithContext = `Please generate an image based on: ${text}`;
              
              // Add text prompt
              parts.push({ text: promptWithContext });
              
              const model = genAI.getGenerativeModel({ 
                model: CONFIG.AI_MODELS.IMAGE_GENERATION,
                safetySettings: imgGenSafetySettings,
              });
              
              return { model, parts };
            };
            
            // Function to handle image generation and save the result
            const generateAndSaveImage = async (model, parts) => {
              // Create a streaming response for image generation
              console.log(chalk.green(CONFIG.CONSOLE.IMAGE_GEN_REQUEST_PARAMS.replace("{0}", JSON.stringify({
                modelName: CONFIG.AI_MODELS.IMAGE_GENERATION,
                partsCount: parts.length,
                promptLength: parts.find(p => p.text)?.text.length || 0
              }))));
              
              const result = await model.generateContent({
                contents: [{ role: "user", parts: parts }],
                generationConfig: {
                  responseModalities: ["image", "text"],
                  responseMimeType: "text/plain",
                  temperature: 1,
                  topP: 0.95,
                  maxOutputTokens: 4096,
                  candidateCount: 1
                },
                safetySettings: imgGenSafetySettings
              });
              
              const response = await result.response;
              console.log(chalk.green(CONFIG.CONSOLE.IMAGE_GEN_RESPONSE.replace("{0}", JSON.stringify(response.candidates ? { candidatesCount: response.candidates.length } : "No candidates"))));
              
              // Find the image part in the response
              let imagePart = null;
              let textResponse = "";
              
              // Check if we have a valid response structure
              if (!response.candidates || !response.candidates[0]) {
                throw new Error("Invalid response structure: No candidates in response");
              }
              
              const candidate = response.candidates[0];
              
              // Handle different response structures
              if (candidate.content) {
                if (candidate.content.parts) {
                  for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                      imagePart = part.inlineData;
                    } else if (part.text) {
                      textResponse += part.text;
                    }
                  }
                } else if (candidate.content.inlineData) {
                  // Handle case where inlineData is directly on content
                  imagePart = candidate.content.inlineData;
                } else if (candidate.content.text) {
                  // Handle case where text is directly on content
                  textResponse = candidate.content.text;
                }
              } else if (candidate.text) {
                // Handle case where text is directly on candidate
                textResponse = candidate.text;
              } else if (candidate.parts) {
                // Handle case where parts is directly on candidate
                for (const part of candidate.parts) {
                  if (part.inlineData) {
                    imagePart = part.inlineData;
                  } else if (part.text) {
                    textResponse += part.text;
                  }
                }
              } else if (candidate.inlineData) {
                // Handle case where inlineData is directly on candidate
                imagePart = candidate.inlineData;
              } else {
                // Log the entire response for debugging
                console.error("Full response structure:", JSON.stringify(response));
                console.error("Candidate structure:", JSON.stringify(candidate));
                throw new Error("Unexpected response structure from image generation API");
              }
              
              if (!imagePart) {
                // Don't show any text to the user, just throw the error
                throw new Error("No image was generated in the response");
              }
              
              // Save the image to a file
              const imageId = Date.now();
              const fileExtension = imagePart.mimeType.split('/')[1] || 'jpg';
              const fileName = `${imageId}.${fileExtension}`;
              const filePath = path.join(imagesDir, fileName);
              
              // Convert base64 to buffer
              const imageBuffer = Buffer.from(imagePart.data, 'base64');
              
              // Save the image
              fs.writeFileSync(filePath, imageBuffer);
              console.log(chalk.green(CONFIG.CONSOLE.GENERATED_IMAGE_SAVED.replace("{0}", filePath)));
              
              // Save response to history
              const historyResponse = textResponse ? 
                `[GENERATED IMAGE:${imageId}] ${textResponse}` : 
                `[GENERATED IMAGE:${imageId}]`;
              
              // Create a new message object for the assistant to avoid using user's info
              const assistantMessage = {
                chat: message.chat,
                botNumber: botNumber,  // Use the bot's number instead of user's
                pushName: "Veo"  // Explicitly set the assistant name
              };
              historyManager.saveMessageToHistory(assistantMessage, 'assistant', historyResponse, "image_gen");
              
              return { imageBuffer, mimeType: imagePart.mimeType, textResponse, filePath, imageId };
            };
            
            // Execute the API call with retry logic
            const executeWithRetry = async () => {
              while (retryCount < MAX_RETRIES) {
                try {
                  const { model, parts } = await prepareImageGenRequest();
                  
                  // Generate and save the image
                  try {
                    const result = await generateAndSaveImage(model, parts);
                    
                    // If result is true, it means we've already handled sending a response to the user
                    if (result === true) {
                      return true;
                    }
                    
                    const { imageBuffer, mimeType, textResponse } = result;
                    
                    // Delete thinking message
                    await sock.sendMessage(message.chat, { delete: thinkingMsgKey });
                    
                    // Send the image without any text caption
                    await sock.sendMessage(message.chat, { 
                      image: imageBuffer,
                      caption: CONFIG.MESSAGES.GENERATED_IMAGE_CAPTION,
                      mimetype: mimeType
                    });
                    
                    // Change reaction from gear to check mark to indicate completion
                    try {
                      await sock.sendMessage(message.chat, {
                        react: {
                          text: "✅", // Check emoji
                          key: message.key
                        }
                      });
                    } catch (reactError) {
                      console.error("Error changing reaction:", reactError);
                      // Continue even if changing reaction fails
                    }
                    
                    // Exit the retry loop on success
                    return true;
                  } catch (genError) {
                    console.error(chalk.red(CONFIG.CONSOLE.IMAGE_GEN_ERROR_DETAILS.replace("{0}", genError.message)));
                    
                    // If the error is "No image was generated", this is likely due to NSFW content
                    if (genError.message.includes("No image was generated in the response")) {
                      // Delete thinking message
                      await sock.sendMessage(message.chat, { delete: thinkingMsgKey });
                      
                      // Send NSFW blocked message to user
                      await message.reply(CONFIG.MESSAGES.NSFW_BLOCKED);
                      
                      // Exit the retry loop (don't retry for this error)
                      return true;
                    }
                    
                    // Re-throw other errors to be caught by the outer try/catch
                    throw new Error(`Image generation failed: ${genError.message}`);
                  }
                } catch (error) {
                  retryCount++;
                  console.error(chalk.red(CONFIG.CONSOLE.RETRY_FAILED.replace("{0}", retryCount).replace("{1}", error.message || "Unknown error")));
                  errorMessages.push(error.message || "Unknown error");
                  
                  // If we've reached the limit, throw the error
                  if (retryCount >= MAX_RETRIES || retryCount >= apiKeyPool.getKeyCount("keygemini")) {
                    throw new Error("Maximum retry attempts reached");
                  }
                  
                  // Show retry message to user
                  isRetrying = true;
                  
                  // Update thinking message to show retry status
                  await sock.sendMessage(message.chat, { 
                    edit: thinkingMsgKey,
                    text: CONFIG.MESSAGES.RETRYING 
                  });
                  
                  // Short delay before retry
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            };
            
            // Start the execution with retry logic
            await executeWithRetry();
            
          } catch (error) {
            // Error handling - also delete thinking message on error
            try {
              // Try to delete the thinking message
              if (typeof thinkingMsgKey !== 'undefined') {
                await sock.sendMessage(message.chat, { delete: thinkingMsgKey });
              }
            } catch (deleteError) {
              console.error("Error deleting thinking message:", deleteError);
            }
            
            // Log errors to console
            console.error(chalk.red(CONFIG.CONSOLE.FINAL_ERROR.replace("{0}", error.message)));
            console.error(chalk.red(CONFIG.CONSOLE.ERROR_MESSAGES.replace("{0}", errorMessages.join(', '))));
            
            // Show final error message to user
            message.reply(CONFIG.MESSAGES.IMAGE_GEN_ERROR);
          }
          */
          break;
        case "ge": // Image editing
          // Show maintenance message and disable the command
          return message.reply(CONFIG.MESSAGES.IMAGE_GEN_MAINTENANCE);
          /*
          try {
            // Check for image in the message
            const messageType = getContentType(message.message);
            const hasImage = messageType === 'imageMessage';
            const hasQuotedImage = message.quoted && getContentType(message.quoted.message) === 'imageMessage';
            
            // For /ge, we require an image upload
            if (!hasImage && !hasQuotedImage) {
              return message.reply("🖼️ Kirim gambar yang ingin kamu edit, lalu tambahkan deskripsi perubahannya setelah `/ge`, contoh: `/ge ubah background jadi biru`");
            }
            
            // Check if user provided a prompt
            if (!text) {
              return message.reply("🤔 Hmm, kamu ingin edit gambarnya seperti apa? Tambahkan deskripsi perubahannya setelah `/ge`, contoh: `/ge tambahkan topi di kepalanya`");
            }
            
            // Send waiting message
            const thinkingMsg = await message.reply(CONFIG.MESSAGES.EDITING_IMAGE);
            let thinkingMsgKey = thinkingMsg.key;
            
            // Add gear emoji reaction to the user's message to indicate processing
            try {
              await sock.sendMessage(message.chat, {
                react: {
                  text: "⚙️", // Gear emoji
                  key: message.key
                }
              });
            } catch (reactError) {
              console.error("Error adding gear reaction:", reactError);
              // Continue processing even if reaction fails
            }
            
            // Prepare data for retry mechanism
            let retryCount = 0;
            const MAX_RETRIES = CONFIG.SYSTEM.MAX_RETRIES; // Maximum number of API keys to try
            let errorMessages = [];
            let isRetrying = false;
            let uploadedImageReference = ""; // Track uploaded image reference
            
            // Set safety settings for image generation
            const imgGenSafetySettings = CONFIG.SAFETY_SETTINGS.IMAGE_GENERATION;
            
            // Create separate directory for image editing history
            const userDir = historyManager.getUserDirectory(message.chat, "image_edit");
            const imagesDir = path.join(userDir, 'generated');
            const uploadedImagesDir = path.join(userDir, 'uploads');
            ensureDirectoryExists(imagesDir);
            ensureDirectoryExists(uploadedImagesDir);
            
            // Process uploaded image
            try {
              console.log(chalk.green(CONFIG.CONSOLE.PROCESSING_IMAGE));
              // Get the message that contains the image
              const imgMsg = hasQuotedImage ? message.quoted : message;
              
              // Download the media as buffer
              const buffer = await downloadMediaMessage(
                imgMsg,
                'buffer',
                {},
                { 
                  logger: console,
                  // For reupload if needed
                  reuploadRequest: sock.updateMediaMessage
                }
              );
              
              // Get mimetype
              const mimetype = hasQuotedImage 
                ? message.quoted.message.imageMessage.mimetype 
                : message.message.imageMessage.mimetype;
              
              console.log(chalk.green(CONFIG.CONSOLE.IMAGE_DOWNLOADED));
              
              // Generate unique ID for the image
              const imageId = Date.now();
              const extension = mimetype.split('/')[1];
              const fileName = `${imageId}.${extension}`;
              const filePath = path.join(uploadedImagesDir, fileName);
              
              // Compress the image
              const compressed = await compressImage(buffer, mimetype);
              
              // Save image to file
              fs.writeFileSync(filePath, compressed.buffer);
              console.log(chalk.green(CONFIG.CONSOLE.SAVED_COMPRESSED_IMAGE.replace("{0}", filePath)));
              
              // Set image reference
              uploadedImageReference = `[UPLOADED IMAGE:${imageId}]`;
              
            } catch (error) {
              console.error(chalk.red(CONFIG.CONSOLE.ERROR_PROCESSING_IMAGE.replace("{0}", error.message)));
              await sock.sendMessage(message.chat, { delete: thinkingMsgKey });
              return message.reply("❌ Gagal memproses gambar. Coba kirim ulang ya!");
            }
            
            // Save user prompt to history (including image reference)
            const userMessageForHistory = `${uploadedImageReference} ${q}`;
            if (!isRetrying) {
              historyManager.saveMessageToHistory(message, 'user', userMessageForHistory, "image_edit");
            }
            
            // Function to load uploaded image for image generation
            const loadUploadedImageForGeneration = (imageReference, chatId) => {
              try {
                // Parse the imageReference correctly
                let imageId;
                
                if (typeof imageReference === 'string') {
                  // If the reference is a complete tag like [UPLOADED IMAGE:12345]
                  if (imageReference.startsWith('[UPLOADED IMAGE:')) {
                    const match = /\[UPLOADED IMAGE:([0-9]+)\]/.exec(imageReference);
                    if (match && match[1]) {
                      imageId = match[1];
                    }
                  } 
                  // If it's already a parsed reference like "UPLOADED IMAGE:12345"
                  else if (imageReference.startsWith('UPLOADED IMAGE:')) {
                    imageId = imageReference.split(':')[1];
                  }
                  // If it's just the ID
                  else {
                    imageId = imageReference;
                  }
                }
                
                if (!imageId) {
                  console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_IMAGE.replace("{0}", imageReference)));
                  return null;
                }
                
                console.log(chalk.green(CONFIG.CONSOLE.UPLOADED_IMAGE_FOUND.replace("{0}", imageId)));
                
                // For historical compatibility, we need to check if chatId is a message object
                const actualChatId = typeof chatId === 'object' ? chatId.chat : chatId;
                const userDir = historyManager.getUserDirectory(actualChatId, "image_edit");
                const uploadsDir = path.join(userDir, 'uploads');
                
                if (!fs.existsSync(uploadsDir)) {
                  console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_IMAGE.replace("{0}", uploadsDir)));
                  return null;
                }
                
                const files = fs.readdirSync(uploadsDir);
                const imageFile = files.find(file => file.startsWith(imageId + '.'));
                
                if (!imageFile) {
                  console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_IMAGE.replace("{0}", imageId)));
                  return null;
                }
                
                const filePath = path.join(uploadsDir, imageFile);
                const buffer = fs.readFileSync(filePath);
                const mimetype = 'image/' + imageFile.split('.').pop();
                
                console.log(chalk.green(CONFIG.CONSOLE.LOADED_IMAGE.replace("{0}", filePath)));
                
                return {
                  data: buffer.toString('base64'),
                  mimeType: mimetype
                };
              } catch (error) {
                console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_IMAGE.replace("{0}", error.message)));
                return null;
              }
            };
            
            // Process user input and prepare API request
            const prepareImageGenRequest = async () => {
              if (!text && !uploadedImageReference) {
                throw new Error("Please provide a description or an image for generation");
              }
              
              // Get API key from the pool
              const geminiApiKey = apiKeyPool.getKey("keygemini");
              
              if (!geminiApiKey) {
                throw new Error("No API key available for Google Gemini");
              }
              
              // Initialize Gemini AI with the selected API key
              const genAI = new GoogleGenerativeAI(geminiApiKey);
              
              console.log(chalk.green(CONFIG.CONSOLE.API_ATTEMPT.replace("{0}", retryCount + 1)));
              
              // Prepare parts for the API request
              let parts = [];
              
              // Add uploaded image if present
              if (uploadedImageReference) {
                console.log(chalk.green(CONFIG.CONSOLE.UPLOADED_IMAGE_FOUND.replace("{0}", uploadedImageReference)));
                const uploadedImageData = loadUploadedImageForGeneration(uploadedImageReference, message.chat);
                if (uploadedImageData) {
                  console.log(chalk.green(CONFIG.CONSOLE.UPLOADED_IMAGE_LOADED.replace("{0}", uploadedImageReference)));
                  parts.push({
                    inlineData: {
                      data: uploadedImageData.data,
                      mimeType: uploadedImageData.mimeType
                    }
                  });
                } else {
                  console.error(chalk.red(CONFIG.CONSOLE.ERROR_LOADING_IMAGE.replace("{0}", uploadedImageReference)));
                }
              }
              
              // Use prompt directly without adding user's name
              const promptWithContext = `${uploadedImageReference ? "Please generate a new image based on this uploaded image and the description: " : "Please generate an image based on: "}${text}`;
              
              // Add text prompt
              parts.push({ text: promptWithContext });
              
              const model = genAI.getGenerativeModel({ 
                model: CONFIG.AI_MODELS.IMAGE_GENERATION,
                safetySettings: imgGenSafetySettings,
              });
              
              return { model, parts };
            };
            
            // Function to handle image generation and save the result
            const generateAndSaveImage = async (model, parts) => {
              // Create a streaming response for image generation
              console.log(chalk.green(CONFIG.CONSOLE.IMAGE_GEN_REQUEST_PARAMS.replace("{0}", JSON.stringify({
                modelName: CONFIG.AI_MODELS.IMAGE_GENERATION,
                partsCount: parts.length,
                hasImage: parts.some(p => p.inlineData),
                promptLength: parts.find(p => p.text)?.text.length || 0
              }))));
              
              const result = await model.generateContent({
                contents: [{ role: "user", parts: parts }],
                generationConfig: {
                  responseModalities: ["image", "text"],
                  responseMimeType: "text/plain",
                  temperature: 1,
                  topP: 0.95,
                  maxOutputTokens: 4096,
                  candidateCount: 1
                },
                safetySettings: imgGenSafetySettings
              });
              
              const response = await result.response;
              console.log(chalk.green(CONFIG.CONSOLE.IMAGE_GEN_RESPONSE.replace("{0}", JSON.stringify(response.candidates ? { candidatesCount: response.candidates.length } : "No candidates"))));
              
              // Find the image part in the response
              let imagePart = null;
              let textResponse = "";
              
              // Check if we have a valid response structure
              if (!response.candidates || !response.candidates[0]) {
                throw new Error("Invalid response structure: No candidates in response");
              }
              
              const candidate = response.candidates[0];
              
              // Handle different response structures
              if (candidate.content) {
                if (candidate.content.parts) {
                  for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                      imagePart = part.inlineData;
                    } else if (part.text) {
                      textResponse += part.text;
                    }
                  }
                } else if (candidate.content.inlineData) {
                  // Handle case where inlineData is directly on content
                  imagePart = candidate.content.inlineData;
                } else if (candidate.content.text) {
                  // Handle case where text is directly on content
                  textResponse = candidate.content.text;
                }
              } else if (candidate.text) {
                // Handle case where text is directly on candidate
                textResponse = candidate.text;
              } else if (candidate.parts) {
                // Handle case where parts is directly on candidate
                for (const part of candidate.parts) {
                  if (part.inlineData) {
                    imagePart = part.inlineData;
                  } else if (part.text) {
                    textResponse += part.text;
                  }
                }
              } else if (candidate.inlineData) {
                // Handle case where inlineData is directly on candidate
                imagePart = candidate.inlineData;
              } else {
                // Log the entire response for debugging
                console.error("Full response structure:", JSON.stringify(response));
                console.error("Candidate structure:", JSON.stringify(candidate));
                throw new Error("Unexpected response structure from image generation API");
              }
              
              if (!imagePart) {
                // Don't show any text to the user, just throw the error
                throw new Error("No image was generated in the response");
              }
              
              // Save the image to a file
              const imageId = Date.now();
              const fileExtension = imagePart.mimeType.split('/')[1] || 'jpg';
              const fileName = `${imageId}.${fileExtension}`;
              const filePath = path.join(imagesDir, fileName);
              
              // Convert base64 to buffer
              const imageBuffer = Buffer.from(imagePart.data, 'base64');
              
              // Save the image
              fs.writeFileSync(filePath, imageBuffer);
              console.log(chalk.green(CONFIG.CONSOLE.GENERATED_IMAGE_SAVED.replace("{0}", filePath)));
              
              // Save response to history - use consistent format with [IMAGE ATTACHED:id] like the /a command
              // This makes it easier to handle both types of images in the future
              const historyResponse = textResponse ? 
                `[GENERATED IMAGE:${imageId}] ${textResponse}` : 
                `[GENERATED IMAGE:${imageId}]`;
              
              // Create a new message object for the assistant to avoid using user's info
              const assistantMessage = {
                chat: message.chat,
                botNumber: botNumber,  // Use the bot's number instead of user's
                pushName: "Veo"  // Explicitly set the assistant name
              };
              historyManager.saveMessageToHistory(assistantMessage, 'assistant', historyResponse, "image_edit");
              
              return { imageBuffer, mimeType: imagePart.mimeType, textResponse, filePath, imageId };
            };
            
            // Execute the API call with retry logic
            const executeWithRetry = async () => {
              while (retryCount < MAX_RETRIES) {
                try {
                  const { model, parts } = await prepareImageGenRequest();
                  
                  // Generate and save the image
                  console.log(chalk.green(CONFIG.CONSOLE.IMAGE_GEN_REQUEST_PARAMS.replace("{0}", JSON.stringify({
                    modelName: CONFIG.AI_MODELS.IMAGE_GENERATION,
                    partsCount: parts.length,
                    hasImage: parts.some(p => p.inlineData),
                    promptLength: parts.find(p => p.text)?.text.length || 0
                  }))));
                  try {
                    const result = await generateAndSaveImage(model, parts);
                    
                    // If result is true, it means we've already handled sending a response to the user
                    // (like when we get text but no image)
                    if (result === true) {
                      return true;
                    }
                    
                    const { imageBuffer, mimeType, textResponse } = result;
                    
                    // Delete thinking message
                    await sock.sendMessage(message.chat, { delete: thinkingMsgKey });
                    
                    // Send the image without any text caption
                    await sock.sendMessage(message.chat, { 
                      image: imageBuffer,
                      caption: CONFIG.MESSAGES.GENERATED_IMAGE_CAPTION,
                      mimetype: mimeType
                    });
                    
                    // Change reaction from gear to check mark to indicate completion
                    try {
                      await sock.sendMessage(message.chat, {
                        react: {
                          text: "✅", // Check emoji
                          key: message.key
                        }
                      });
                    } catch (reactError) {
                      console.error("Error changing reaction:", reactError);
                      // Continue even if changing reaction fails
                    }
                    
                    // Exit the retry loop on success
                    return true;
                  } catch (genError) {
                    console.error(chalk.red(CONFIG.CONSOLE.IMAGE_GEN_ERROR_DETAILS.replace("{0}", genError.message)));
                    
                    // If the error is "No image was generated", this is likely due to NSFW content
                    if (genError.message.includes("No image was generated in the response")) {
                      // Delete thinking message
                      await sock.sendMessage(message.chat, { delete: thinkingMsgKey });
                      
                      // Send NSFW blocked message to user
                      await message.reply(CONFIG.MESSAGES.NSFW_BLOCKED);
                      
                      // Exit the retry loop (don't retry for this error)
                      return true;
                    }
                    
                    // Re-throw other errors to be caught by the outer try/catch
                    throw new Error(`Image generation failed: ${genError.message}`);
                  }
                } catch (error) {
                  retryCount++;
                  console.error(chalk.red(CONFIG.CONSOLE.RETRY_FAILED.replace("{0}", retryCount).replace("{1}", error.message || "Unknown error")));
                  errorMessages.push(error.message || "Unknown error");
                  
                  // If we've reached the limit, throw the error
                  if (retryCount >= MAX_RETRIES || retryCount >= apiKeyPool.getKeyCount("keygemini")) {
                    throw new Error("Maximum retry attempts reached");
                  }
                  
                  // Show retry message to user
                  isRetrying = true;
                  
                  // Update thinking message to show retry status
                  await sock.sendMessage(message.chat, { 
                    edit: thinkingMsgKey,
                    text: CONFIG.MESSAGES.RETRYING 
                  });
                  
                  // Short delay before retry
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            };
            
            // Start the execution with retry logic
            await executeWithRetry();
            
          } catch (error) {
            // Error handling - also delete thinking message on error
            try {
              // Try to delete the thinking message
              if (typeof thinkingMsgKey !== 'undefined') {
                await sock.sendMessage(message.chat, { delete: thinkingMsgKey });
              }
            } catch (deleteError) {
              console.error("Error deleting thinking message:", deleteError);
            }
            
            // Log errors to console
            console.error(chalk.red(CONFIG.CONSOLE.FINAL_ERROR.replace("{0}", error.message)));
            console.error(chalk.red(CONFIG.CONSOLE.ERROR_MESSAGES.replace("{0}", errorMessages.join(', '))));
            
            // Show final error message to user
            message.reply(CONFIG.MESSAGES.IMAGE_GEN_ERROR);
          }
          */
          break;
        case "setpp":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            // Check if image is uploaded
            const hasImage = getContentType(message.message) === 'imageMessage';
            const hasQuotedImage = message.quoted && getContentType(message.quoted.message) === 'imageMessage';
            
            if (!hasImage && !hasQuotedImage) {
              return message.reply("Please upload an image with this command to set as profile picture.");
            }
            
            // Send waiting message
            const waitMsg = await message.reply(CONFIG.MESSAGES.CHANGING_PROFILE_PIC);
            
            // Get the message that contains the image
            const imgMsg = hasQuotedImage ? message.quoted : message;
            
            // Download the media as buffer
            const buffer = await downloadMediaMessage(
              imgMsg,
              'buffer',
              {},
              { 
                logger: console,
                reuploadRequest: sock.updateMediaMessage
              }
            );
            
            // Compress the image
            const compressed = await compressImage(buffer, 'image/jpeg');
            
            // Update profile picture - Fix: Pass buffer directly instead of object
            await sock.updateProfilePicture(botNumber, compressed.buffer);
            
            // Delete waiting message
            await sock.sendMessage(message.chat, { delete: waitMsg.key });
            
            // Confirm to the user
            message.reply("✅ Bot profile picture has been updated successfully.");
          } catch (error) {
            console.error("Error setting profile picture:", error);
            message.reply("❌ Error setting profile picture.");
          }
          break;
          
        case "setname":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            if (!text) {
              return message.reply(`Format: ${prefix}setname [new name]`);
            }
            
            // Send waiting message
            const waitMsg = await message.reply(CONFIG.MESSAGES.CHANGING_PROFILE_NAME);
            
            // Update profile name
            await sock.updateProfileName(text);
            
            // Delete waiting message
            await sock.sendMessage(message.chat, { delete: waitMsg.key });
            
            // Confirm to the user
            message.reply(`✅ Bot name has been changed to "${text}".`);
          } catch (error) {
            console.error("Error setting profile name:", error);
            message.reply("❌ Error setting profile name.");
          }
          break;
        
        case "mute":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            if (!text) {
              // Global mute
              CONFIG.BOT_STATE.GLOBAL_MUTE = true;
              message.reply("✅ Veo has been muted globally. Use /unmute to unmute.");
            } else {
              // Mute specific user
              const phoneNumber = text.trim();
              if (muteUser(phoneNumber)) {
                message.reply(`✅ User ${phoneNumber} has been muted.`);
                
                // Send notification to the muted user
                try {
                  const normalizedNumber = normalizePhoneNumber(phoneNumber);
                  await sock.sendMessage(normalizedNumber, { text: CONFIG.MESSAGES.USER_MUTED });
                } catch (notifyError) {
                  console.error("Error notifying muted user:", notifyError);
                }
              } else {
                message.reply(`❌ User ${phoneNumber} is already muted or there was an error.`);
              }
            }
          } catch (error) {
            console.error("Error muting:", error);
            message.reply("❌ Error while processing mute command.");
          }
          break;
          
        case "unmute":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            if (!text) {
              // Global unmute
              CONFIG.BOT_STATE.GLOBAL_MUTE = false;
              message.reply("✅ Veo has been unmuted globally.");
            } else {
              // Unmute specific user
              const phoneNumber = text.trim();
              if (unmuteUser(phoneNumber)) {
                message.reply(`✅ User ${phoneNumber} has been unmuted.`);
                
                // Send notification to the unmuted user
                try {
                  const normalizedNumber = normalizePhoneNumber(phoneNumber);
                  await sock.sendMessage(normalizedNumber, { text: "You have been unmuted by the admin." });
                } catch (notifyError) {
                  console.error("Error notifying unmuted user:", notifyError);
                }
              } else {
                message.reply(`❌ User ${phoneNumber} is not muted or there was an error.`);
              }
            }
          } catch (error) {
            console.error("Error unmuting:", error);
            message.reply("❌ Error while processing unmute command.");
          }
          break;
          
        case "maintenanceon":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            CONFIG.BOT_STATE.MAINTENANCE_MODE = true;
            message.reply("✅ Maintenance mode has been activated. Use /maintenanceoff to disable.");
          } catch (error) {
            console.error("Error activating maintenance mode:", error);
            message.reply("❌ Error while activating maintenance mode.");
          }
          break;
          
        case "maintenanceoff":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            CONFIG.BOT_STATE.MAINTENANCE_MODE = false;
            message.reply("✅ Maintenance mode has been deactivated.");
          } catch (error) {
            console.error("Error deactivating maintenance mode:", error);
            message.reply("❌ Error while deactivating maintenance mode.");
          }
          break;
          
        case "say":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            // Format: /say phonenumber text
            const firstSpace = text.indexOf(' ');
            if (firstSpace === -1) {
              return message.reply(`Format: ${prefix}say [phone number] [message]`);
            }
            
            const phoneNumber = text.substring(0, firstSpace).trim();
            const messageText = text.substring(firstSpace + 1).trim();
            
            if (!phoneNumber || !messageText) {
              return message.reply(`Format: ${prefix}say [phone number] [message]`);
            }
            
            const normalizedNumber = normalizePhoneNumber(phoneNumber);
            await sock.sendMessage(normalizedNumber, { text: "*VEO SYSTEM:* " + messageText });
            
            message.reply(`✅ Message sent to ${phoneNumber}: "${messageText}"`);
          } catch (error) {
            console.error("Error sending message:", error);
            message.reply("❌ Error while sending the message.");
          }
          break;
        
        case "showsystem":
          // Check if sender is admin
          if (!isAdmin) {
            return message.reply(CONFIG.MESSAGES.ACCESS_DENIED);
          }
          
          try {
            // Read the system.txt file
            const systemPrompt = fs.readFileSync('./system.txt', 'utf8');
            
            // Send the entire system.txt content to admin
            await sock.sendMessage(message.chat, {
              text: systemPrompt
            });
            
            console.log(chalk.green("System prompt sent to admin"));
          } catch (error) {
            console.error(chalk.red(`Error sending system prompt: ${error.message}`));
            message.reply("Veo: error saat mengirim system prompt");
          }
          break;
        
        default: {
          if (isCmd && budy.toLowerCase() != undefined) {
            if (message.chat.endsWith("broadcast")) return;
            if (message.isBaileys) return;
            if (!budy.toLowerCase()) return;
            if (argsLog || (isCmd && !message.isGroup)) {
              // sock.sendReadReceipt(message.chat, message.sender, [message.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            } else if (argsLog || (isCmd && message.isGroup)) {
              // sock.sendReadReceipt(message.chat, message.sender, [message.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            }
          }
        }
      }
    }
  } catch (err) {
    // Log error to console but don't show details to user
    console.error(chalk.red(CONFIG.CONSOLE.ERROR_IN_MAIN.replace("{0}", err.message)));
    message.reply("System Error. Silakan coba lagi nanti.");
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
