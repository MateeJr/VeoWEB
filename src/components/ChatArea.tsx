"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Copy, Edit, RefreshCw, Check, WrapText, ArrowLeftRight, Save } from 'lucide-react';
import Marked from 'marked-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  saveConversation, 
  convertChatMessagesToHistory, 
  generateConversationId, 
  generateConversationTitle,
  ConversationHistory 
} from '../utils/HistoryManager';

// Chat message interface (same as in ChatBox)
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date; 
  isThinking?: boolean;
  type?: 'text' | 'image' | 'file';
  fileInfo?: { name: string; type: string; size: number };
}

interface ChatAreaProps {
  messages: ChatMessage[];
  isVisible: boolean; // Control visibility based on if any messages exist
  onEditMessage?: (messageId: string, text: string) => void;
  onRegenerateMessage?: () => void;
  userId: string; // Required user ID for saving conversation history
  conversationId?: string; // Optional conversation ID if continuing a conversation
  isIncognitoMode?: boolean; // Whether incognito mode is enabled
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  isVisible,
  onEditMessage,
  onRegenerateMessage,
  userId, // Required, no default
  conversationId,
  isIncognitoMode = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string>(conversationId || generateConversationId());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize conversation ID
  useEffect(() => {
    if (!conversationId) {
      setCurrentConversationId(generateConversationId());
    } else {
      setCurrentConversationId(conversationId);
    }
  }, [conversationId]);

  // Show centered success notification
  const showCenterSuccess = (message: string) => {
    // Create a new div element for the success
    const successContainer = document.createElement('div');
    successContainer.className = 'fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none';
    
    // Setup the inner content
    successContainer.innerHTML = `
        <div class="animate-in fade-in zoom-in duration-300 flex items-center gap-2 bg-black/90 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span class="text-sm">${message}</span>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(successContainer);
    
    // Remove after display time
    setTimeout(() => {
        const notificationElement = successContainer.firstElementChild as HTMLElement;
        // Apply the fade-out classes
        notificationElement.classList.remove('animate-in', 'fade-in', 'zoom-in');
        notificationElement.classList.add('animate-out', 'fade-out', 'zoom-out');
        
        // Wait for animation to complete before removing from DOM
        notificationElement.addEventListener('animationend', () => {
            if (document.body.contains(successContainer)) {
                document.body.removeChild(successContainer);
            }
        });
        
        // Fallback timeout in case the animation event doesn't fire
        setTimeout(() => {
            if (document.body.contains(successContainer)) {
                document.body.removeChild(successContainer);
            }
        }, 500);
    }, 2000);
  };

  // Handle copy message
  const handleCopyMessage = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(messageId);
      showCenterSuccess("Copied to clipboard");
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  // Auto-save conversation when messages change
  useEffect(() => {
    const autoSaveConversation = async () => {
      // Skip empty conversations
      if (messages.length === 0) return;
      
      // Skip saving if in incognito mode
      if (isIncognitoMode) {
        console.log('Incognito mode enabled - skipping conversation save');
        return;
      }
      
      try {
        if (!userId) {
          console.error("Cannot save conversation: User ID is required");
          return;
        }
        
        // Convert messages to history format
        const historyMessages = convertChatMessagesToHistory(messages);
        
        // Create conversation history object
        const conversation: ConversationHistory = {
          id: currentConversationId,
          title: generateConversationTitle(historyMessages),
          messages: historyMessages,
          createdAt: messages.length > 0 ? messages[0].timestamp.toISOString() : new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Save to disk via API silently
        await saveConversation(userId, conversation);
        console.log(`Auto-saved conversation ${currentConversationId} for user ${userId} with ${messages.length} messages`);
      } catch (error) {
        console.error("Failed to auto-save conversation:", error);
      }
    };

    // Auto-save when messages change
    if (messages.length > 0) {
      const debounceTimer = setTimeout(() => {
        autoSaveConversation();
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(debounceTimer);
    }
  }, [messages, currentConversationId, userId, isIncognitoMode]);

  // This is the markdown renderer component
  const MarkdownRenderer = useCallback(({ content }: { content: string }) => {
    interface CodeBlockProps {
      language: string | undefined;
      children: string;
    }

    // Generate unique keys for markdown elements
    const keyGen = {
      current: 0,
      next: () => `md-${keyGen.current++}`
    };

    const CodeBlock: React.FC<CodeBlockProps> = ({ language, children }) => {
      const [isCopied, setIsCopied] = useState(false);
      const [isWrapped, setIsWrapped] = useState(false);
      const theme = resolvedTheme;

      const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(children);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }, [children]);

      const toggleWrap = useCallback(() => {
        setIsWrapped(prev => !prev);
      }, []);

      return (
        <div className="group my-4 relative">
          <div className="rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <div className="px-2 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {language || 'text'}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleWrap}
                  className={`
                    px-2 py-1
                    rounded text-xs font-medium
                    transition-all duration-200
                    ${isWrapped ? 'text-primary' : 'text-neutral-500 dark:text-neutral-400'}
                    hover:bg-neutral-200 dark:hover:bg-neutral-700
                    flex items-center gap-1.5
                  `}
                  aria-label="Toggle line wrapping"
                >
                  {isWrapped ? (
                    <>
                      <ArrowLeftRight className="h-3 w-3" />
                      <span className="hidden sm:inline">Unwrap</span>
                    </>
                  ) : (
                    <>
                      <WrapText className="h-3 w-3" />
                      <span className="hidden sm:inline">Wrap</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className={`
                    px-2 py-1
                    rounded text-xs font-medium
                    transition-all duration-200
                    ${isCopied ? 'text-primary' : 'text-neutral-500 dark:text-neutral-400'}
                    hover:bg-neutral-200 dark:hover:bg-neutral-700
                    flex items-center gap-1.5
                  `}
                  aria-label="Copy code"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span className="hidden sm:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <SyntaxHighlighter
              language={language || 'text'}
              style={theme === 'dark' ? oneDark : oneLight}
              customStyle={{
                margin: 0,
                padding: '0.75rem 0.25rem 0.75rem',
                backgroundColor: theme === 'dark' ? '#171717' : 'transparent',
                borderRadius: 0,
                borderBottomLeftRadius: '0.375rem',
                borderBottomRightRadius: '0.375rem',
              }}
              showLineNumbers={true}
              lineNumberStyle={{
                textAlign: 'right',
                color: theme === 'dark' ? '#6b7280' : '#808080',
                backgroundColor: 'transparent',
                fontStyle: 'normal',
                marginRight: '1em',
                paddingRight: '0.5em',
                minWidth: '2em'
              }}
              lineNumberContainerStyle={{
                backgroundColor: theme === 'dark' ? '#171717' : '#f5f5f5',
                float: 'left'
              }}
              wrapLongLines={isWrapped}
              codeTagProps={{
                style: {
                  fontSize: '0.85em',
                  whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
                  overflowWrap: isWrapped ? 'break-word' : 'normal',
                  wordBreak: isWrapped ? 'break-word' : 'keep-all'
                }
              }}
            >
              {children}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    };

    // Create a simple custom renderer for markdown
    const renderer = {
      // Text elements
      text: (text: string) => {
        return <React.Fragment key={keyGen.next()}>{text}</React.Fragment>;
      },
      
      paragraph: (children: React.ReactNode) => (
        <p className="my-4 leading-relaxed" key={keyGen.next()}>{children}</p>
      ),
      
      // Code blocks with syntax highlighting
      code: (children: string, language?: string) => (
        <CodeBlock language={language} key={keyGen.next()}>{children}</CodeBlock>
      ),
      
      // Headings with different sizes
      heading: (children: React.ReactNode, level: number) => {
        const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements;
        const sizeClasses = {
          1: "text-2xl font-bold mt-6 mb-4",
          2: "text-xl font-bold mt-5 mb-3",
          3: "text-lg font-semibold mt-4 mb-2",
          4: "text-base font-medium mt-3 mb-2",
          5: "text-sm font-medium mt-2 mb-1",
          6: "text-xs font-medium mt-2 mb-1",
        }[level as 1 | 2 | 3 | 4 | 5 | 6] || "";

        return (
          <HeadingTag className={`${sizeClasses} tracking-tight`} key={keyGen.next()}>
            {children}
          </HeadingTag>
        );
      },
      
      // Lists
      list: (children: React.ReactNode, ordered?: boolean) => {
        const ListTag = ordered ? 'ol' : 'ul';
        return (
          <ListTag className={`my-4 pl-6 space-y-1 ${ordered ? 'list-decimal' : 'list-disc'}`} key={keyGen.next()}>
            {children}
          </ListTag>
        );
      },
      
      // List items
      listItem: (children: React.ReactNode) => (
        <li className="pl-1 leading-relaxed" key={keyGen.next()}>{children}</li>
      ),
      
      // Blockquotes
      blockquote: (children: React.ReactNode) => (
        <blockquote className="my-4 border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 italic" key={keyGen.next()}>
          {children}
        </blockquote>
      ),
      
      // Links
      link: (href: string, children: React.ReactNode) => (
        <a href={href} className="text-blue-500 dark:text-blue-400 hover:underline" key={keyGen.next()}>
          {children}
        </a>
      ),
      
      // Tables
      table: (children: React.ReactNode) => (
        <div className="my-4 overflow-x-auto" key={keyGen.next()}>
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
            {children}
          </table>
        </div>
      ),
      
      tableRow: (children: React.ReactNode) => (
        <tr className="border-b border-gray-300 dark:border-gray-700" key={keyGen.next()}>
          {children}
        </tr>
      ),
      
      tableCell: (children: React.ReactNode, flags: any) => {
        const key = keyGen.next();
        if (flags?.header) {
          return (
            <th className="px-4 py-2 text-left border-r border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" key={key}>
              {children}
            </th>
          );
        }
        
        return (
          <td className="px-4 py-2 border-r border-gray-300 dark:border-gray-700" key={key}>
            {children}
          </td>
        );
      },

      // Headers and footers for tables
      tableHead: (children: React.ReactNode) => (
        <thead key={keyGen.next()}>{children}</thead>
      ),

      tableFoot: (children: React.ReactNode) => (
        <tfoot key={keyGen.next()}>{children}</tfoot>
      ),

      tableBody: (children: React.ReactNode) => (
        <tbody key={keyGen.next()}>{children}</tbody>
      )
    };

    return (
      <div className="markdown-content">
        <Marked renderer={renderer}>
          {content}
        </Marked>
      </div>
    );
  }, [resolvedTheme]);

  // Add CSS for the pulsing dots animation and fixed chat area
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .messages-container {
        height: calc(100vh - 180px);
        overflow-y: auto;
        overflow-x: hidden;
        padding: 1rem;
        padding-top: 80px; /* Add extra padding at the top to avoid header overlap */
        position: relative;
        scroll-behavior: smooth;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .messages-container::-webkit-scrollbar {
        width: 6px;
      }

      .messages-container::-webkit-scrollbar-track {
        background: transparent;
      }

      .messages-container::-webkit-scrollbar-thumb {
        background-color: rgba(155, 155, 155, 0.5);
        border-radius: 20px;
      }

      .thinking-dots {
        display: flex;
        gap: 6px;
        align-items: center;
        justify-content: center;
        padding: 8px;
      }
      
      .thinking-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: ${resolvedTheme === 'dark' ? '#fff' : '#000'};
      }
      
      .dot-1 {
        animation: dot-pulse 1.5s infinite ease-in-out 0s;
      }
      
      .dot-2 {
        animation: dot-pulse 1.5s infinite ease-in-out 0.2s;
      }
      
      .dot-3 {
        animation: dot-pulse 1.5s infinite ease-in-out 0.4s;
      }

      @keyframes dot-pulse {
        0% {
          transform: scale(0.6);
          opacity: 0.3;
        }
        50% {
          transform: scale(1.2);
          opacity: 1;
        }
        100% {
          transform: scale(0.6);
          opacity: 0.3;
        }
      }

      .message-container {
        position: relative;
        padding: 0.5rem 1rem;
        width: 100%;
      }

      .message-actions {
        position: absolute;
        display: none;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 10;
      }

      .message-container:hover .message-actions {
        display: flex;
      }

      .message-action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--background-secondary);
        border: 1px solid var(--border);
        color: var(--foreground-secondary);
        transition: all 0.2s ease;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }

      .message-action-button:hover {
        background-color: var(--secondary);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }

      .user-message .message-actions {
        right: auto;
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
      }

      .ai-message .message-actions {
        left: auto;
        right: -40px;
        top: 50%;
        transform: translateY(-50%);
      }

      /* Responsive adjustments for small screens */
      @media (max-width: 640px) {
        .user-message .message-actions, .ai-message .message-actions {
          top: 0;
          transform: translateY(0);
        }

        .user-message .message-actions {
          left: 0;
        }

        .ai-message .message-actions {
          right: 0;
        }
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, [resolvedTheme]); // Re-create when theme changes

  if (!isVisible || messages.length === 0) {
    return null;
  }

  // Find the index of the last user message
  const lastUserMessageIndex = messages.map(m => m.isUser).lastIndexOf(true);

  return (
    <div className="w-full flex flex-col" style={{ marginBottom: '110px' }}>
      <div className="messages-container" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`message-container ${message.isUser ? 'user-message' : 'ai-message'}`}
          >
            {message.isUser ? (
              <div className="flex items-center w-full justify-end relative group">
                {/* User Message Actions - Positioned right before the message */}
                {!message.isThinking && (
                  <div className="user-actions-container hidden group-hover:flex flex-row mr-2 items-center gap-2">
                    <button
                      className="message-action-button"
                      onClick={() => handleCopyMessage(message.text, message.id)}
                      aria-label="Copy message"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    
                    {onEditMessage && (
                      <button
                        className="message-action-button"
                        onClick={() => onEditMessage(message.id, message.text)}
                        aria-label="Edit message"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                
                <div
                  className="max-w-[80%] md:max-w-[70%] p-3 rounded-2xl rounded-tr-none text-white"
                  style={{
                    backgroundColor: '#464646',
                    position: 'relative'
                  }}
                >
                  {message.isThinking ? (
                    <div className="thinking-dots">
                      <div className="thinking-dot dot-1" />
                      <div className="thinking-dot dot-2" />
                      <div className="thinking-dot dot-3" />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{message.text}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center w-full justify-start relative group">
                <div
                  className="max-w-[80%] md:max-w-[70%] p-3 rounded-2xl bg-card text-card-foreground rounded-tl-none"
                >
                  {message.isThinking ? (
                    <div className="thinking-dots">
                      <div className="thinking-dot dot-1" />
                      <div className="thinking-dot dot-2" />
                      <div className="thinking-dot dot-3" />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">
                      <MarkdownRenderer content={message.text} />
                    </div>
                  )}
                </div>
                
                {/* AI Message Actions - Positioned right after the message */}
                {!message.isThinking && (
                  <div className="hidden group-hover:flex flex-row ml-2 items-center gap-2">
                    <button
                      className="message-action-button"
                      onClick={() => handleCopyMessage(message.text, message.id)}
                      aria-label="Copy message"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    
                    {onRegenerateMessage && index === messages.length - 1 && (
                      <button
                        className="message-action-button"
                        onClick={onRegenerateMessage}
                        aria-label="Regenerate response"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatArea;