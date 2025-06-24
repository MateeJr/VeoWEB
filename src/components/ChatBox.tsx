"use client";

import React, { useState, useEffect, useRef, CSSProperties as ReactCSSProperties, useMemo } from 'react';
import { LuPaperclip, LuGlobe, LuZap, LuSquarePen, LuSparkles, LuMaximize2, LuMinimize2, LuVideo, LuMic, LuSend, LuSearch, LuTrash2, LuCopy, LuCheck, LuThumbsUp, LuThumbsDown, LuRefreshCw } from 'react-icons/lu';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '../utils/auth';
import { useIncognito } from '../contexts/IncognitoContext';
import { useTheme } from '../contexts/ThemeContext';
import ChatArea from './ChatArea';
import { v4 as uuidv4 } from 'uuid';
import { 
  processWithGemini, 
  processWithHistory, 
  processWithGeminiStream, 
  processWithHistoryStream 
} from '../utils/GeminiHandler';
import { convertChatMessagesToHistory, ConversationHistory, generateConversationId } from '../utils/HistoryManager';
import LoginModal from './LoginModal';
import { saveThought, loadThoughts } from '../utils/ThoughtStore';

// ChatMessage interface
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date; 
  isThinking?: boolean;
  isReasoning?: boolean;
  isSearching?: boolean;
  type?: 'text' | 'image' | 'file';
  fileInfo?: { name: string; type: string; size: number };
  images?: { data: string; type: string; name: string }[];
  thinkDuration?: number;
  isStreaming?: boolean;
  thoughtSummary?: string;
}

// Add props interface for ChatBox
interface ChatBoxProps {
  initialConversation?: ConversationHistory | null;
}

// Animated button text that re-types with fade-in while preserving button width
const AnimatedButtonText: React.FC<{ text: string; isActive: boolean }> = ({ text, isActive }) => {
  const characters = useMemo(() => text.split(''), [text]);
  const [visibleCount, setVisibleCount] = useState<number>(isActive ? 0 : characters.length);

  useEffect(() => {
    if (!isActive) {
      setVisibleCount(characters.length);
      return;
    }

    setVisibleCount(0); // restart typing effect
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setVisibleCount(index);
      if (index >= characters.length) {
        clearInterval(timer);
      }
    }, 40); // speed per character

    return () => clearInterval(timer);
  }, [isActive, characters.length]);

  return (
    <span className="relative ml-2 text-sm hidden sm:inline-block" style={{ color: 'var(--foreground)' }}>
      {/* Invisible placeholder keeps width constant */}
      <span className="opacity-0 select-none pointer-events-none">{text}</span>

      {/* Streaming overlay */}
      <span className="absolute inset-0 flex">
        {characters.slice(0, visibleCount).map((char, idx) => (
          <span
            key={idx}
            className="streaming-word"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
};

const ChatBox: React.FC<ChatBoxProps> = ({ initialConversation }) => {
  // Add theme context and router
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [isSearchToggled, setIsSearchToggled] = useState(true);
  const [isReasonToggled, setIsReasonToggled] = useState(false);
  const [isAgenticResearchToggled, setIsAgenticResearchToggled] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const [isTextareaExpanded, setIsTextareaExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  // Mobile tooltip state
  const [mobileTooltipTargetId, setMobileTooltipTargetId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number, y: number } | null>(null);
  const [hasMessages, setHasMessages] = useState(false);
  const [bottomPosition, setBottomPosition] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [originalMessages, setOriginalMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [attachedImages, setAttachedImages] = useState<{ data: string; type: string; name: string }[]>([]);
  const [videoModeEnabled, setVideoModeEnabled] = useState<boolean>(false);

  const { user, loggedIn, loading: authLoading } = useAuth();
  const { isIncognitoMode } = useIncognito();
  const [userDisplayName, setUserDisplayName] = useState<string>("Loading...");

  // Red highlight color for active toggles (replaces previous blue accent)
  const highlightColor = '#b30000';
  const highlightHover = '#c40000';
  const highlightForeground = '#ffffff';

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initialize with conversation if provided
  useEffect(() => {
    if (initialConversation) {
      // Set conversation ID
      setConversationId(initialConversation.id);
      
      // Convert MessageHistory[] to ChatMessage[]
      const convertedMessages = initialConversation.messages.map(msg => ({
        id: uuidv4(),
        text: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.timestamp),
        isReasoning: msg.isReasoning,
        thinkDuration: msg.thinkDuration,
        images: msg.images // Include images when loading from history
      }));
      
      setMessages(convertedMessages);
      setHasMessages(convertedMessages.length > 0);
      setBottomPosition(true);
      
      console.log(`Loaded conversation: ${initialConversation.id} with ${convertedMessages.length} messages`);
    } else {
      // No conversation provided, generate a new ID
      setConversationId(generateConversationId());
    }
  }, [initialConversation]);

  // Load stored thoughts when conversationId changes
  useEffect(() => {
    if (!conversationId) return;
    const stored = loadThoughts(conversationId);
    if (Object.keys(stored).length > 0) {
      setMessages(prev => prev.map(m => stored[m.id] ? { ...m, thoughtSummary: stored[m.id] } : m ));
    }
  }, [conversationId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Close tooltips when clicking outside buttons
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      // Only run this on mobile
      if (!isMobile || !mobileTooltipTargetId) return;
      
      // Check if click is on a button or inside a tooltip
      const target = event.target as HTMLElement;
      const isButtonOrTooltip = (
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('[data-tooltip-id]') ||
        target.closest('.react-tooltip')
      );
      
      if (!isButtonOrTooltip) {
        setMobileTooltipTargetId(null);
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isMobile, mobileTooltipTargetId]);

  const handleMobileItemTouchStart = (e: React.TouchEvent<HTMLButtonElement>, buttonId: string) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    longPressTimerRef.current = setTimeout(() => {
      setMobileTooltipTargetId(buttonId);
      longPressTimerRef.current = null; 
    }, 500); // 500ms for long press
  };

  const handleMobileItemTouchEnd = (buttonId: string) => {
    if (longPressTimerRef.current) { // Timer was pending (short tap)
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      // If a tooltip for this button is already open from a previous long press,
      // and this is a short tap, then close it.
      if (mobileTooltipTargetId === buttonId) {
        setMobileTooltipTargetId(null);
      }
    } 
    else if (mobileTooltipTargetId === buttonId) {
      // If tooltip is showing (long press completed), close it after a short delay
      // This allows the tooltip to be visible when clicking the button
      setTimeout(() => {
        setMobileTooltipTargetId(null);
      }, 1500); // 1.5 seconds to keep tooltip visible after tap
    }
    touchStartPosRef.current = null;
  };

  const handleMobileItemTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (longPressTimerRef.current && touchStartPosRef.current) {
      const threshold = 10; // pixels
      const deltaX = Math.abs(e.touches[0].clientX - touchStartPosRef.current.x);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartPosRef.current.y);
      if (deltaX > threshold || deltaY > threshold) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        touchStartPosRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (!authLoading && loggedIn && user) {
      setUserDisplayName(user.username || (user.email ? user.email.split('@')[0] : 'I am Veo'));
    } else if (!authLoading && !loggedIn) {
      setUserDisplayName('I am Veo');
    }
  }, [authLoading, loggedIn, user]);

  const handleSearchToggle = () => {
    // Toggle search state
    const newSearchState = !isSearchToggled;
    setIsSearchToggled(newSearchState);
  };

  const handleReasonToggle = () => {
    setIsReasonToggled(!isReasonToggled);
  };

  const handleAgenticResearchToggle = () => {
    setIsAgenticResearchToggled(!isAgenticResearchToggled);
  };

  // Add handler for the New Chat button
  const handleNewChat = () => {
    // Refresh the page by redirecting to the homepage
    window.location.href = '/';
  };

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      // On mobile, don't submit on Enter; allow new line instead
      if (isMobile) {
        return; // Just create a new line (default textarea behavior)
      }
      // On desktop, submit the form
      event.preventDefault();
      handleSendMessage();
    }
  };

  const searchDisabled = isAgenticResearchToggled;
  const reasonDisabled = isAgenticResearchToggled;
  const agenticResearchDisabled = isSearchToggled || isReasonToggled;
  const paperclipDisabled = isAgenticResearchToggled;

  // Add purple glow if incognito mode is active
  const incognitoGlowStyle: ReactCSSProperties = isIncognitoMode ? {
    boxShadow: '0 0 0 2px rgba(160, 32, 240, 0.6), 0 0 10px rgba(160, 32, 240, 0.4), 0 0 20px rgba(160, 32, 240, 0.2)',
    border: '1px solid rgba(160, 32, 240, 0.8)'
  } : {};

  const commonBlackButtonStyle: ReactCSSProperties = {
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '9999px',
    backgroundColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-md)',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
    cursor: 'pointer',
  };

  const shimmerTextStyle: ReactCSSProperties = {
    position: 'relative',
    display: 'inline-block',
    color: 'var(--foreground)',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, var(--foreground), var(--foreground-secondary), var(--foreground))',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'shimmer 2s infinite linear',
  };

  React.useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Modified wrapper style for conditional positioning
  const wrapperStyle: ReactCSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: hasMessages ? 'flex-end' : 'center', // Center when no messages, bottom when chatting
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    paddingBottom: hasMessages ? '1rem' : 0,
    overflowX: 'hidden'
  };

  // Modified container style
  const containerStyle: ReactCSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    border: '1px solid var(--card-border)',
    borderRadius: '2rem',
    overflow: 'hidden',
    backgroundColor: 'var(--card-background)',
    transition: 'box-shadow 0.3s ease',
    position: 'relative',
    zIndex: 10
  };

  // Input container style - only fixed position when there are messages
  const inputContainerStyle: ReactCSSProperties = hasMessages ? {
    position: 'fixed',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '800px',
    padding: '0 1rem',
    zIndex: 20,
  } : {
    width: '100%',
    maxWidth: '800px',
    padding: '0 1rem',
    zIndex: 20,
  };

  const dynamicContainerStyle: ReactCSSProperties = {
    ...containerStyle,
    boxShadow: isMobile && isTextareaFocused ? 'var(--shadow-lg)' : 'none',
    ...(isTextareaFocused ? {} : { 
      ':hover': {
        boxShadow: 'var(--shadow-lg)'
      }
    }),
  };

  const inputIconStyle: ReactCSSProperties = {
    color: 'var(--foreground-secondary)',
    width: '1rem',
    height: '1rem'
  };

  // Add custom CSS for textarea placeholder
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    
    // Add the CSS rules for the placeholder
    styleEl.textContent = `
      textarea::placeholder {
        color: var(--input-placeholder) !important;
        opacity: 1 !important;
        transition: color 0.3s ease !important;
      }
    `;
    
    // Append to the document head
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, [resolvedTheme]); // Re-run when theme changes to ensure it's updated

  // Handle editing a message
  const handleEditMessage = (messageId: string, text: string) => {
    // Find the message to edit
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // Store original messages for potential cancellation
    setOriginalMessages([...messages]);
    
    // Set the editing state and ID
    setIsEditingMessage(true);
    setEditingMessageId(messageId);
    
    // Set the textarea value to the message content
    setTextareaValue(text);
    
    // Focus the textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  };

  // Modifying handleRegenerateMessage to include thinking budget
  const handleRegenerateMessage = async () => {
    // Find the last user message before the AI message
    const messagesCopy = [...messages];
    messagesCopy.pop(); // Remove the most recent AI message
    
    // Find the last user message
    let lastUserMessageIndex = -1;
    for (let i = messagesCopy.length - 1; i >= 0; i--) {
      if (messagesCopy[i].isUser) {
        lastUserMessageIndex = i;
        break;
      }
    }
    
    if (lastUserMessageIndex === -1) {
      console.error('No user message found to regenerate from');
      return;
    }
    
    const lastUserMessage = messagesCopy[lastUserMessageIndex];
    setMessages(messagesCopy); // Remove the AI message
    
    // Get thinking budget - explicitly set to 0 if reason is off
    const thinkingBudget = isReasonToggled ? 0 : 8192;
    console.log(`Using thinking budget: ${thinkingBudget} (Reason: ${isReasonToggled ? 'ON' : 'OFF'})`);
    console.log(`Search mode: ${isSearchToggled ? 'ON' : 'OFF'}`);
    
    // Add thinking indicator and create a response message that will be streamed
    const aiResponseId = uuidv4();
    const aiResponseMessage: ChatMessage = {
      id: aiResponseId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isThinking: true,
      isReasoning: !isReasonToggled,
      isSearching: isSearchToggled,
      isStreaming: true,
    };
    
    setMessages(prev => [...prev, aiResponseMessage]);
    
    try {
      // Convert previous messages to history format for context
      const historyMessages = convertChatMessagesToHistory(messagesCopy);
      
      // Process streaming chunks with history
      await processWithHistoryStream(
        lastUserMessage.text,
        historyMessages,
        (chunk) => {
          // Update message with each chunk received
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const responseIndex = updatedMessages.findIndex(m => m.id === aiResponseId);
            
            if (responseIndex !== -1) {
              if (chunk.startsWith('__THOUGHT__')) {
                const thought = chunk.replace('__THOUGHT__', '');
                const newSummary = (updatedMessages[responseIndex].thoughtSummary || '') + thought;
                updatedMessages[responseIndex] = {
                  ...updatedMessages[responseIndex],
                  thoughtSummary: newSummary
                };
                if (conversationId) saveThought(conversationId, updatedMessages[responseIndex].id, newSummary);
              } else {
                // Update existing message with answer text and done thinking
                updatedMessages[responseIndex] = {
                  ...updatedMessages[responseIndex],
                  text: updatedMessages[responseIndex].text + chunk,
                  isThinking: false
                };
              }
            }
            
            return updatedMessages;
          });
        },
        thinkingBudget,
        isSearchToggled // Pass search toggle state
      );

      // Mark streaming as finished
      setMessages(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(m => m.id === aiResponseId);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], isStreaming: false };
        }
        return updated;
      });
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      // Handle error case (already handled in the stream function)
    }
  };

  // Handle file input change for image attachments
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Check if adding these files would exceed the 10 image limit
    if (attachedImages.length + files.length > 10) {
      alert("You can only attach up to 10 images at once.");
      return;
    }
    
    // Process each selected file
    Array.from(files).forEach(file => {
      // Check if file is an image of supported type
      const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif'];
      if (!validImageTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please select images only.`);
        return;
      }
      
      // Read the file as data URL (base64)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setAttachedImages(prev => [
            ...prev, 
            { 
              data: result,
              type: file.type,
              name: file.name
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove an attached image
  const removeAttachedImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle clicking the attachment button
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle pasting images directly into the textarea
  const handleTextareaPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif'];

    Array.from(items).forEach(item => {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (!file) return;

        if (!validImageTypes.includes(file.type)) return;

        if (attachedImages.length >= 10) {
          alert('You can only attach up to 10 images at once.');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setAttachedImages(prev => [
              ...prev,
              {
                data: result,
                type: file.type,
                name: file.name || `pasted-${Date.now()}`
              }
            ]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Update handleSendMessage to include attached images
  const handleSendMessage = async () => {
    if (textareaValue.trim() === '' && attachedImages.length === 0) return;
    
    // Check if user is logged in before allowing to send message
    if (!loggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    
    // Get thinking budget - explicitly set to 0 if reason is off
    const thinkingBudget = isReasonToggled ? 0 : 8192;
    console.log(`Using thinking budget: ${thinkingBudget} (Reason: ${isReasonToggled ? 'ON' : 'OFF'})`);
    console.log(`Search mode: ${isSearchToggled ? 'ON' : 'OFF'}`);
    
    if (isEditingMessage && editingMessageId) {
      // Handle message editing
      // Find the index of the editing message
      const editIndex = messages.findIndex(m => m.id === editingMessageId);
      if (editIndex === -1) return;

      // Create a copy of messages and update the edited message
      const updatedMessages = [...messages];
      updatedMessages[editIndex] = {
        ...updatedMessages[editIndex],
        text: textareaValue
      };

      // Remove all messages after the edited message
      const newMessages = updatedMessages.slice(0, editIndex + 1);
      setMessages(newMessages);
      setHasMessages(true);
      setBottomPosition(true);
      
      // Add AI response message that will be streamed
      const aiResponseId = uuidv4();
      const aiResponseMessage: ChatMessage = {
        id: aiResponseId,
        text: '',
        isUser: false,
        timestamp: new Date(),
        isThinking: true,
        isReasoning: !isReasonToggled,
        isSearching: isSearchToggled,
        isStreaming: true,
      };
      
      setMessages(prevMessages => [...prevMessages, aiResponseMessage]);
      
      // Reset states
      setTextareaValue('');
      setIsTextareaExpanded(false);
      setIsEditingMessage(false);
      setEditingMessageId(null);
      
      try {
        // Convert previous messages to history format for context
        const historyMessages = convertChatMessagesToHistory(newMessages);
        
        // Get streaming response from Gemini with history
        await processWithHistoryStream(
          updatedMessages[editIndex].text, 
          historyMessages, 
          (chunk) => {
            // Update message with each chunk received
            setMessages(prevMessages => {
              const currentMessages = [...prevMessages];
              const responseIndex = currentMessages.findIndex(m => m.id === aiResponseId);
              
              if (responseIndex !== -1) {
                if (chunk.startsWith('__THOUGHT__')) {
                  const thought = chunk.replace('__THOUGHT__', '');
                  const newSummary = (currentMessages[responseIndex].thoughtSummary || '') + thought;
                  currentMessages[responseIndex] = {
                    ...currentMessages[responseIndex],
                    thoughtSummary: newSummary
                  };
                  if (conversationId) saveThought(conversationId, currentMessages[responseIndex].id, newSummary);
                } else {
                  // Update existing message with answer text and done thinking
                  currentMessages[responseIndex] = {
                    ...currentMessages[responseIndex],
                    text: currentMessages[responseIndex].text + chunk,
                    isThinking: false
                  };
                }
              }
              
              return currentMessages;
            });
          },
          thinkingBudget,
          isSearchToggled, // Pass search toggle state
          updatedMessages[editIndex].images // Pass attached images
        );

        // Mark streaming as finished
        setMessages(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(m => m.id === aiResponseId);
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], isStreaming: false };
          }
          return updated;
        });
      } catch (error) {
        console.error('Error getting Gemini response:', error);
        // Error handling is done within the stream function
      }
      
      return;
    }
    
    // Regular new message flow
    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      text: textareaValue,
      isUser: true,
      timestamp: new Date(),
      isSearching: isSearchToggled,
      images: attachedImages.length > 0 ? attachedImages : undefined
    };
    
    const userMessageText = textareaValue;
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setTextareaValue('');
    setIsTextareaExpanded(false);
    setHasMessages(true);
    setBottomPosition(true);
    
    // Clear attached images after sending
    setAttachedImages([]);
    
    // Simulate AI response
    setIsResponding(true);
    
    // Add AI response message that will be streamed
    const aiResponseId = uuidv4();
    const aiResponseMessage: ChatMessage = {
      id: aiResponseId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isThinking: true,
      isReasoning: !isReasonToggled,
      isSearching: isSearchToggled,
      isStreaming: true,
    };
    
    setMessages(prevMessages => [...prevMessages, aiResponseMessage]);
    
    try {
      // Convert previous messages to history format for context
      const historyMessages = convertChatMessagesToHistory(messages);
      
      // Get streaming response from Gemini with history
      await processWithHistoryStream(
        userMessageText, 
        historyMessages, 
        (chunk) => {
          // Update message with each chunk received
          setMessages(prevMessages => {
            const currentMessages = [...prevMessages];
            const responseIndex = currentMessages.findIndex(m => m.id === aiResponseId);
            
            if (responseIndex !== -1) {
              if (chunk.startsWith('__THOUGHT__')) {
                const thought = chunk.replace('__THOUGHT__', '');
                const newSummary = (currentMessages[responseIndex].thoughtSummary || '') + thought;
                currentMessages[responseIndex] = {
                  ...currentMessages[responseIndex],
                  thoughtSummary: newSummary
                };
                if (conversationId) saveThought(conversationId, currentMessages[responseIndex].id, newSummary);
              } else {
                // Update existing message with answer text and done thinking
                currentMessages[responseIndex] = {
                  ...currentMessages[responseIndex],
                  text: currentMessages[responseIndex].text + chunk,
                  isThinking: false
                };
              }
            }
            
            return currentMessages;
          });
        },
        thinkingBudget,
        isSearchToggled, // Pass search toggle state
        attachedImages.length > 0 ? newUserMessage.images : undefined // Pass attached images
      );

      // Mark streaming as finished
      setMessages(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(m => m.id === aiResponseId);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], isStreaming: false };
        }
        return updated;
      });
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      // Error handling is done within the stream function
    } finally {
      setIsResponding(false);
    }
  };

  // Cancel editing function
  const handleCancelEdit = () => {
    setIsEditingMessage(false);
    setEditingMessageId(null);
    setTextareaValue('');
    setMessages(originalMessages);
  };

  // Handle login modal
  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  // Authentication modal that appears when user tries to send a message
  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-lg shadow-lg bg-card border border-card-border text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <h2 className="text-2xl font-bold text-foreground">Authentication Required</h2>
        <p className="text-foreground-secondary mb-4">
          You need to sign in to send messages.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleLoginModalClose}
            className="py-3 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={openLoginModal}
            className="py-3 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm cursor-pointer font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );

  // Delete a user message and the following AI message and all after
  const handleDeleteMessage = (messageId: string) => {
    const userMsgIdx = messages.findIndex(m => m.id === messageId && m.isUser);
    if (userMsgIdx === -1) return;
    // Find the next AI message after the user message
    let endIdx = userMsgIdx + 1;
    while (endIdx < messages.length && messages[endIdx].isUser) {
      endIdx++;
    }
    // If the next message is AI, include it
    if (endIdx < messages.length && !messages[endIdx].isUser) {
      endIdx++;
    }
    // Remove all messages from userMsgIdx to end
    setMessages(messages.slice(0, userMsgIdx));
    setHasMessages(messages.slice(0, userMsgIdx).length > 0);
  };

  // Add image preview component
  const ImagePreview = () => {
    if (attachedImages.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 p-3 border-b border-card-border">
        {attachedImages.map((image, index) => (
          <div key={index} className="relative group">
            <img 
              src={image.data} 
              alt={`Attached image ${index + 1}`} 
              className="w-20 h-20 object-cover rounded-md border border-card-border"
            />
            <button
              onClick={() => removeAttachedImage(index)}
              className="absolute -top-2 -right-2 bg-background text-destructive p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={wrapperStyle}>
      {isLoginModalOpen && <AuthModal />}
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={handleLoginModalClose} />}
      
      <Tooltip 
        id="chatbox-tooltip" 
        style={{ 
          zIndex: 9999, 
          borderRadius: '8px', 
          boxShadow: 'var(--shadow-md)'
        }} 
        variant="light"
        clickable={isMobile ? true : undefined}
        delayShow={isMobile ? 9999999 : undefined}
      />
      <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 md:px-8">
        {!hasMessages && (
          <div className="text-center mb-4 flex flex-col">
            <div 
              style={{
                display: 'block',
                marginBottom: '0rem',
                color: 'var(--foreground)',
                fontWeight: 'bold'
              }} 
              className="text-2xl"
            >
              Hi,{' '}
              <span style={shimmerTextStyle}>
                {userDisplayName}
              </span>
              .
            </div>
            <br />
            <div 
              style={{
                display: 'block',
                color: 'var(--foreground)',
                fontWeight: 'bold'
              }} 
              className="text-2xl"
            >
              What can I help you with?
            </div>
          </div>
        )}
        
        <div className="w-full md:w-[800px]">
          <ChatArea 
            messages={messages} 
            isVisible={hasMessages}
            onEditMessage={handleEditMessage}
            onRegenerateMessage={handleRegenerateMessage}
            onDeleteMessage={handleDeleteMessage}
            userId={user?.createdAt?.toString() || `guest-${Date.now()}`}
            conversationId={conversationId || undefined}
            isIncognitoMode={isIncognitoMode}
          />
          
          <div style={inputContainerStyle}>
            <div 
              style={{
                ...dynamicContainerStyle,
                ...incognitoGlowStyle
              }}
            >
              {isEditingMessage && (
                <div className="bg-accent/20 text-accent px-4 py-3 text-sm font-medium flex items-center justify-between border-b border-accent/30">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>Editing message</span>
                  </div>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-accent/10 hover:bg-accent/20 text-accent font-medium px-3 py-1 rounded-md cursor-pointer transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancel
                  </button>
                </div>
              )}
              
              {/* Render image preview component */}
              <ImagePreview />
              
              {(isTextareaExpanded || textareaValue.trim().length > 0) && (
                <button
                  id="expand-button"
                  type="button"
                  onClick={() => setIsTextareaExpanded(!isTextareaExpanded)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full active:scale-90 transition-all"
                  aria-label={isTextareaExpanded ? "Collapse textarea" : "Expand textarea"}
                  data-tooltip-id="chatbox-tooltip"
                  data-tooltip-content={isTextareaExpanded ? "Collapse" : "Expand"}
                  data-tooltip-place="top"
                  style={{ 
                    color: 'var(--foreground-secondary)',
                    backgroundColor: 'var(--background-secondary)',
                    top: isEditingMessage ? 'calc(2.5rem + 6px)' : '0.75rem',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
                  onTouchStart={isMobile ? (e) => handleMobileItemTouchStart(e, 'expand-button') : undefined}
                  onTouchEnd={isMobile ? () => handleMobileItemTouchEnd('expand-button') : undefined}
                  onTouchMove={isMobile ? handleMobileItemTouchMove : undefined}
                >
                  {isTextareaExpanded ? (
                    <LuMinimize2 style={inputIconStyle} />
                  ) : (
                    <LuMaximize2 style={inputIconStyle} />
                  )}
                </button>
              )}
              <textarea
                className="w-full p-4 focus:outline-none resize-none bg-transparent pr-24 placeholder-theme"
                rows={isTextareaExpanded ? 8 : 1}
                placeholder={isEditingMessage ? "Edit pesan..." : (isIncognitoMode ? "Incognito mode..." : "Ask me anything...")}
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                onPaste={handleTextareaPaste}
                onFocus={() => setIsTextareaFocused(true)}
                onBlur={() => setIsTextareaFocused(false)}
                style={{ 
                  color: 'var(--foreground)', 
                  caretColor: highlightColor,
                  backgroundColor: 'transparent'
                }}
              />
              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                {videoModeEnabled && (
                  <button
                    id="video-input-button"
                    type="button"
                    style={{ ...commonBlackButtonStyle, backgroundColor: highlightColor }}
                    aria-label="Start video input"
                    data-tooltip-id="chatbox-tooltip"
                    data-tooltip-content="Start video input"
                    data-tooltip-place="top"
                    onClick={() => router.push('/multimodal')}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = highlightHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = highlightColor; e.currentTarget.style.transform = 'translateY(0)'; }}
                    onTouchStart={isMobile ? (e) => handleMobileItemTouchStart(e, 'video-input-button') : undefined}
                    onTouchEnd={isMobile ? () => handleMobileItemTouchEnd('video-input-button') : undefined}
                    onTouchMove={isMobile ? handleMobileItemTouchMove : undefined}
                  >
                    <LuVideo style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-foreground)' }} />
                  </button>
                )}
                <motion.button
                  id="send-button"
                  type="button"
                  style={{ ...commonBlackButtonStyle, backgroundColor: highlightColor }}
                  aria-label="Send"
                  data-tooltip-id="chatbox-tooltip"
                  data-tooltip-content={isEditingMessage ? "Update message" : "Send Message"}
                  data-tooltip-place="top"
                  onClick={handleSendMessage}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = highlightHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = highlightColor; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onTouchStart={isMobile ? (e) => handleMobileItemTouchStart(e, 'send-button') : undefined}
                  onTouchEnd={isMobile ? () => handleMobileItemTouchEnd('send-button') : undefined}
                  onTouchMove={isMobile ? handleMobileItemTouchMove : undefined}
                  animate={{ boxShadow: ['0 0 0px rgba(179,0,0,0.4)', '0 0 14px rgba(179,0,0,0.9)', '0 0 0px rgba(179,0,0,0.4)'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
                  </svg>
                </motion.button>
              </div>
              <div className="w-full p-4 flex items-center space-x-2">
                <button
                  id="new-chat-button"
                  type="button"
                  className="p-2 rounded-full transition-colors transition-transform duration-200 ring-1 cursor-pointer active:scale-90"
                  aria-label="New Chat"
                  data-tooltip-id="chatbox-tooltip"
                  data-tooltip-content="New Chat"
                  data-tooltip-place="top"
                  onClick={handleNewChat}
                  style={{ 
                    backgroundColor: 'var(--background-secondary)', 
                    borderColor: 'var(--border)',
                    color: 'var(--foreground-secondary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
                  onTouchStart={isMobile ? (e) => handleMobileItemTouchStart(e, 'new-chat-button') : undefined}
                  onTouchEnd={isMobile ? () => handleMobileItemTouchEnd('new-chat-button') : undefined}
                  onTouchMove={isMobile ? handleMobileItemTouchMove : undefined}
                >
                  <LuSquarePen style={inputIconStyle} />
                </button>
                <button
                  id="attach-file-button"
                  type="button"
                  disabled={paperclipDisabled}
                  className={`p-2 rounded-full transition-colors transition-transform duration-200 ring-1 active:scale-90 ${
                    paperclipDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                  aria-label="Attach file"
                  data-tooltip-id="chatbox-tooltip"
                  data-tooltip-content="Attach Images"
                  data-tooltip-place="top"
                  style={{ 
                    backgroundColor: paperclipDisabled ? 'var(--secondary)' : 'var(--background-secondary)', 
                    borderColor: 'var(--border)',
                    color: paperclipDisabled ? 'var(--foreground-secondary)' : 'var(--foreground-secondary)'
                  }}
                  onClick={!paperclipDisabled ? handleAttachmentClick : undefined}
                  onMouseEnter={(e) => !paperclipDisabled && (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
                  onMouseLeave={(e) => !paperclipDisabled && (e.currentTarget.style.backgroundColor = 'var(--background-secondary)')}
                  onTouchStart={!paperclipDisabled && isMobile ? (e) => handleMobileItemTouchStart(e, 'attach-file-button') : undefined}
                  onTouchEnd={!paperclipDisabled && isMobile ? () => handleMobileItemTouchEnd('attach-file-button') : undefined}
                  onTouchMove={!paperclipDisabled && isMobile ? handleMobileItemTouchMove : undefined}
                >
                  <LuPaperclip style={inputIconStyle} />
                </button>
                <motion.button
                  id="search-button"
                  type="button"
                  onClick={handleSearchToggle}
                  disabled={searchDisabled}
                  className={`p-2 sm:px-4 sm:py-2 rounded-full transition-colors transition-transform duration-200 flex items-center active:scale-95 ${
                    searchDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  aria-label="Search"
                  data-tooltip-id="chatbox-tooltip"
                  data-tooltip-content="Browse the web"
                  data-tooltip-place="top"
                  style={{ 
                    backgroundColor: searchDisabled ? 'var(--secondary)' : 'var(--background-secondary)', 
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: searchDisabled ? 'var(--border)' : (isSearchToggled ? highlightColor : 'var(--border)'),
                    color: searchDisabled ? 'var(--foreground-secondary)' : (isSearchToggled ? highlightColor : 'var(--foreground-secondary)')
                  }}
                  onMouseEnter={(e) => !searchDisabled && (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
                  onMouseLeave={(e) => !searchDisabled && (e.currentTarget.style.backgroundColor = 'var(--background-secondary)')}
                  onTouchStart={!searchDisabled && isMobile ? (e) => handleMobileItemTouchStart(e, 'search-button') : undefined}
                  onTouchEnd={!searchDisabled && isMobile ? () => handleMobileItemTouchEnd('search-button') : undefined}
                  onTouchMove={!searchDisabled && isMobile ? handleMobileItemTouchMove : undefined}
                  animate={isSearchToggled && !searchDisabled ? { boxShadow: ['0 0 0px rgba(179,0,0,0.4)', '0 0 12px rgba(179,0,0,0.9)', '0 0 0px rgba(179,0,0,0.4)'] } : undefined}
                  transition={isSearchToggled && !searchDisabled ? { duration: 2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } : undefined}
                >
                  <LuGlobe style={{...inputIconStyle, color: searchDisabled ? 'var(--foreground-secondary)' : (isSearchToggled ? highlightColor : 'var(--foreground-secondary)')}} />
                  <AnimatedButtonText text="Search" isActive={isSearchToggled && !searchDisabled} />
                </motion.button>
                <motion.button
                  id="reason-button"
                  type="button"
                  onClick={handleReasonToggle}
                  disabled={reasonDisabled}
                  className={`p-2 sm:px-4 sm:py-2 rounded-full transition-colors transition-transform duration-200 flex items-center active:scale-95 ${reasonDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label="Instant"
                  data-tooltip-id="chatbox-tooltip"
                  data-tooltip-content="Instant response (reducing accuracy)"
                  data-tooltip-place="top"
                  style={{ 
                    backgroundColor: reasonDisabled ? 'var(--secondary)' : 'var(--background-secondary)', 
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: reasonDisabled ? 'var(--border)' : (isReasonToggled ? highlightColor : 'var(--border)'),
                    color: reasonDisabled ? 'var(--foreground-secondary)' : (isReasonToggled ? highlightColor : 'var(--foreground-secondary)')
                  }}
                  onMouseEnter={(e) => !reasonDisabled && (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
                  onMouseLeave={(e) => !reasonDisabled && (e.currentTarget.style.backgroundColor = 'var(--background-secondary)')}
                  onTouchStart={!reasonDisabled && isMobile ? (e) => handleMobileItemTouchStart(e, 'reason-button') : undefined}
                  onTouchEnd={!reasonDisabled && isMobile ? () => handleMobileItemTouchEnd('reason-button') : undefined}
                  onTouchMove={!reasonDisabled && isMobile ? handleMobileItemTouchMove : undefined}
                  animate={isReasonToggled && !reasonDisabled ? { boxShadow: ['0 0 0px rgba(179,0,0,0.4)', '0 0 12px rgba(179,0,0,0.9)', '0 0 0px rgba(179,0,0,0.4)'] } : undefined}
                  transition={isReasonToggled && !reasonDisabled ? { duration: 2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } : undefined}
                >
                  <LuZap style={{...inputIconStyle, color: reasonDisabled ? 'var(--foreground-secondary)' : (isReasonToggled ? highlightColor : 'var(--foreground-secondary)')}} />
                  <AnimatedButtonText text="Instant" isActive={isReasonToggled && !reasonDisabled} />
                </motion.button>
                <button
                  id="agentic-button"
                  type="button"
                  onClick={handleAgenticResearchToggle}
                  disabled={agenticResearchDisabled}
                  className={`p-2 sm:px-4 sm:py-2 rounded-full transition-colors transition-transform duration-200 flex items-center ${agenticResearchDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                  aria-label="Agent"
                  data-tooltip-id="chatbox-tooltip"
                  data-tooltip-content="Agent"
                  data-tooltip-place="top"
                  style={{ 
                    backgroundColor: agenticResearchDisabled ? 'var(--secondary)' : 'var(--background-secondary)', 
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: agenticResearchDisabled ? 'var(--border)' : (isAgenticResearchToggled ? highlightColor : 'var(--border)'),
                    color: agenticResearchDisabled ? 'var(--foreground-secondary)' : (isAgenticResearchToggled ? highlightColor : 'var(--foreground-secondary)')
                  }}
                >
                  <LuSparkles style={{...inputIconStyle, color: agenticResearchDisabled ? 'var(--foreground-secondary)' : (isAgenticResearchToggled ? highlightColor : 'var(--foreground-secondary)')}} />
                  <AnimatedButtonText text="Agent" isActive={isAgenticResearchToggled && !agenticResearchDisabled} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Tooltip 
        anchorSelect="#expand-button" 
        content={isTextareaExpanded ? "Collapse" : "Expand"} 
        isOpen={mobileTooltipTargetId === 'expand-button'} 
        place="top"
        style={{zIndex: 1002}} 
      />
      <Tooltip 
        anchorSelect="#video-input-button" 
        content="Start video input" 
        isOpen={mobileTooltipTargetId === 'video-input-button'} 
        place="top"
        style={{zIndex: 1002}} 
      />
      <Tooltip 
        anchorSelect="#send-button" 
        content="Send Message" 
        isOpen={mobileTooltipTargetId === 'send-button'} 
        place="top"
        style={{zIndex: 1002}} 
      />
      <Tooltip 
        anchorSelect="#new-chat-button" 
        content="New Chat" 
        isOpen={mobileTooltipTargetId === 'new-chat-button'} 
        place="top"
        style={{zIndex: 1002}} 
      />
      <Tooltip 
        anchorSelect="#attach-file-button" 
        content="Attach Images" 
        isOpen={mobileTooltipTargetId === 'attach-file-button'} 
        place="top"
        style={{zIndex: 1002}} 
      />
      <Tooltip 
        anchorSelect="#search-button" 
        content="Browse the web" 
        isOpen={mobileTooltipTargetId === 'search-button'} 
        place="top"
        style={{zIndex: 1002}} 
      />
      <Tooltip 
        anchorSelect="#reason-button" 
        content="Instant response" 
        isOpen={mobileTooltipTargetId === 'reason-button'} 
        place="top"
        style={{zIndex: 1002}} 
      />
      <Tooltip 
        anchorSelect="#agentic-button" 
        content="Agent" 
        isOpen={mobileTooltipTargetId === 'agentic-button'} 
        place="top"
        style={{zIndex: 1002}} 
      />
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default ChatBox;