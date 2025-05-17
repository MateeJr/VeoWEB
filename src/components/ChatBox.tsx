"use client";

import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { LuPaperclip, LuGlobe, LuLightbulb, LuSquarePen, LuSparkles, LuMaximize2, LuMinimize2, LuVideo, LuMic, LuSend, LuSearch, LuTrash2, LuCopy, LuCheck, LuThumbsUp, LuThumbsDown, LuRefreshCw } from 'react-icons/lu';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../utils/auth';
import { useIncognito } from '../contexts/IncognitoContext';
import { useTheme } from '../contexts/ThemeContext';

// Added basic ChatMessage interface
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date; 
  // Add other properties like reactions, attachments, type, etc. as needed
  feedback?: 'liked' | 'disliked' | null;
  isThinking?: boolean;
  type?: 'text' | 'image' | 'file';
  fileInfo?: { name: string; type: string; size: number };
}

const ChatBox: React.FC = () => {
  // Add theme context
  const { resolvedTheme } = useTheme();
  const [isSearchToggled, setIsSearchToggled] = useState(false);
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

  const { user, loggedIn, loading: authLoading } = useAuth();
  const { isIncognitoMode } = useIncognito();
  const [userDisplayName, setUserDisplayName] = useState<string>("User");

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!authLoading && loggedIn && user) {
      setUserDisplayName(user.username || (user.email ? user.email.split('@')[0] : 'I am Veo'));
    } else if (!authLoading && !loggedIn) {
      setUserDisplayName('I am Veo');
    }
  }, [authLoading, loggedIn, user]);

  const handleSearchToggle = () => {
    setIsSearchToggled(!isSearchToggled);
  };

  const handleReasonToggle = () => {
    setIsReasonToggled(!isReasonToggled);
  };

  const handleAgenticResearchToggle = () => {
    setIsAgenticResearchToggled(!isAgenticResearchToggled);
  };

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      console.log('Enter pressed, message would send:', textareaValue);
    }
  };

  const searchDisabled = isAgenticResearchToggled;
  const reasonDisabled = isAgenticResearchToggled;
  const agenticResearchDisabled = isSearchToggled || isReasonToggled;
  const paperclipDisabled = isAgenticResearchToggled;

  // Add purple glow if incognito mode is active
  const incognitoGlowStyle: CSSProperties = isIncognitoMode ? {
    boxShadow: '0 0 0 2px rgba(160, 32, 240, 0.6), 0 0 10px rgba(160, 32, 240, 0.4), 0 0 20px rgba(160, 32, 240, 0.2)',
    border: '1px solid rgba(160, 32, 240, 0.8)'
  } : {};

  const commonBlackButtonStyle: CSSProperties = {
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

  const shimmerTextStyle: CSSProperties = {
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

  // Wrapper style to properly center the ChatBox content
  const wrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh)',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    paddingTop: 0,
    paddingBottom: 0
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    border: '1px solid var(--card-border)',
    borderRadius: '2rem',
    overflow: 'hidden',
    backgroundColor: 'var(--card-background)',
    transition: 'box-shadow 0.3s ease',
    position: 'relative',
  };

  const dynamicContainerStyle: CSSProperties = {
    ...containerStyle,
    boxShadow: isMobile && isTextareaFocused ? 'var(--shadow-lg)' : 'none',
    ...(isTextareaFocused ? {} : { 
      ':hover': {
        boxShadow: 'var(--shadow-lg)'
      }
    }),
  };

  const inputIconStyle: CSSProperties = {
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

  return (
    <div style={wrapperStyle}>
      <Tooltip 
        id="chatbox-tooltip" 
        style={{ 
          zIndex: 9999, 
          borderRadius: '8px', 
          boxShadow: 'var(--shadow-md)'
        }} 
        variant="light"
      />
      <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 md:px-8">
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
            Hello,{' '}
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
            How can I help you today?
          </div>
        </div>
        <div className="w-full md:w-[800px]">
          <div 
            style={{
              ...dynamicContainerStyle,
              ...incognitoGlowStyle
            }}
          >
            {(isTextareaExpanded || textareaValue.trim().length > 0) && (
              <button
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
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
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
              placeholder={isIncognitoMode ? "Ask me privately..." : "Ask me anything..."}
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              onFocus={() => setIsTextareaFocused(true)}
              onBlur={() => setIsTextareaFocused(false)}
              style={{ 
                color: 'var(--foreground)', 
                caretColor: 'var(--primary)',
                backgroundColor: 'transparent'
              }}
            />
            <div className="absolute bottom-4 right-4 flex items-center space-x-2">
              <button
                type="button"
                style={commonBlackButtonStyle}
                aria-label="Start video input"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Start video input"
                data-tooltip-place="top"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <LuVideo style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-foreground)' }} />
              </button>
              <button
                type="button"
                style={commonBlackButtonStyle}
                aria-label="Send"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Send Message"
                data-tooltip-place="top"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" style={{ width: '1.25rem', height: '1.25rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
                </svg>
              </button>
            </div>
            <div className="w-full p-4 flex items-center space-x-2">
              <button
                type="button"
                className="p-2 rounded-full transition-colors transition-transform duration-200 ring-1 cursor-pointer active:scale-90"
                aria-label="New Chat"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="New Chat"
                data-tooltip-place="top"
                style={{ 
                  backgroundColor: 'var(--background-secondary)', 
                  borderColor: 'var(--border)',
                  color: 'var(--foreground-secondary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
              >
                <LuSquarePen style={inputIconStyle} />
              </button>
              <button
                type="button"
                disabled={paperclipDisabled}
                className={`p-2 rounded-full transition-colors transition-transform duration-200 ring-1 active:scale-90 ${
                  paperclipDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
                aria-label="Attach file"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Attach Files"
                data-tooltip-place="top"
                style={{ 
                  backgroundColor: paperclipDisabled ? 'var(--secondary)' : 'var(--background-secondary)', 
                  borderColor: 'var(--border)',
                  color: paperclipDisabled ? 'var(--foreground-secondary)' : 'var(--foreground-secondary)'
                }}
                onMouseEnter={(e) => !paperclipDisabled && (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
                onMouseLeave={(e) => !paperclipDisabled && (e.currentTarget.style.backgroundColor = 'var(--background-secondary)')}
              >
                <LuPaperclip style={inputIconStyle} />
              </button>
              <button
                type="button"
                onClick={handleSearchToggle}
                disabled={searchDisabled}
                className={`p-2 sm:px-4 sm:py-2 rounded-full transition-colors transition-transform duration-200 flex items-center active:scale-95 ${
                  searchDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                aria-label="Search"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Always Browse the web"
                data-tooltip-place="top"
                style={{ 
                  backgroundColor: searchDisabled ? 'var(--secondary)' : (isSearchToggled ? 'var(--accent)' : 'var(--background-secondary)'), 
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: searchDisabled ? 'var(--border)' : (isSearchToggled ? 'var(--accent-foreground)' : 'var(--border)'),
                  color: searchDisabled ? 'var(--foreground-secondary)' : (isSearchToggled ? 'var(--accent-foreground)' : 'var(--foreground-secondary)')
                }}
                onMouseEnter={(e) => !searchDisabled && (e.currentTarget.style.backgroundColor = isSearchToggled ? 'var(--accent)' : 'var(--secondary)')}
                onMouseLeave={(e) => !searchDisabled && (e.currentTarget.style.backgroundColor = isSearchToggled ? 'var(--accent)' : 'var(--background-secondary)')}
              >
                <LuGlobe style={{...inputIconStyle, color: searchDisabled ? 'var(--foreground-secondary)' : (isSearchToggled ? 'var(--accent-foreground)' : 'var(--foreground-secondary)')}} />
                <span style={{ color: 'var(--foreground)' }} className={`hidden sm:inline ml-2 text-sm`}>Search</span>
              </button>
              <button
                type="button"
                onClick={handleReasonToggle}
                disabled={reasonDisabled}
                className={`p-2 sm:px-4 sm:py-2 rounded-full transition-colors transition-transform duration-200 flex items-center active:scale-95 ${reasonDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-label="Reason"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Think before responding"
                data-tooltip-place="top"
                style={{ 
                  backgroundColor: reasonDisabled ? 'var(--secondary)' : (isReasonToggled ? 'var(--accent)' : 'var(--background-secondary)'), 
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: reasonDisabled ? 'var(--border)' : (isReasonToggled ? 'var(--accent-foreground)' : 'var(--border)'),
                  color: reasonDisabled ? 'var(--foreground-secondary)' : (isReasonToggled ? 'var(--accent-foreground)' : 'var(--foreground-secondary)')
                }}
                onMouseEnter={(e) => !reasonDisabled && (e.currentTarget.style.backgroundColor = isReasonToggled ? 'var(--accent)' : 'var(--secondary)')}
                onMouseLeave={(e) => !reasonDisabled && (e.currentTarget.style.backgroundColor = isReasonToggled ? 'var(--accent)' : 'var(--background-secondary)')}
              >
                <LuLightbulb style={{...inputIconStyle, color: reasonDisabled ? 'var(--foreground-secondary)' : (isReasonToggled ? 'var(--accent-foreground)' : 'var(--foreground-secondary)')}} />
                <span style={{ color: 'var(--foreground)' }} className={`hidden sm:inline ml-2 text-sm`}>Reason</span>
              </button>
              <button
                type="button"
                onClick={handleAgenticResearchToggle}
                disabled={agenticResearchDisabled}
                className={`p-2 sm:px-4 sm:py-2 rounded-full transition-colors transition-transform duration-200 flex items-center active:scale-95 ${agenticResearchDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-label="Agentic Search"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Smart Web Search ~ BETA"
                data-tooltip-place="top"
                style={{ 
                  backgroundColor: agenticResearchDisabled ? 'var(--secondary)' : (isAgenticResearchToggled ? 'var(--accent)' : 'var(--background-secondary)'), 
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: agenticResearchDisabled ? 'var(--border)' : (isAgenticResearchToggled ? 'var(--accent-foreground)' : 'var(--border)'),
                  color: agenticResearchDisabled ? 'var(--foreground-secondary)' : (isAgenticResearchToggled ? 'var(--accent-foreground)' : 'var(--foreground-secondary)')
                }}
                onMouseEnter={(e) => !agenticResearchDisabled && (e.currentTarget.style.backgroundColor = isAgenticResearchToggled ? 'var(--accent)' : 'var(--secondary)')}
                onMouseLeave={(e) => !agenticResearchDisabled && (e.currentTarget.style.backgroundColor = isAgenticResearchToggled ? 'var(--accent)' : 'var(--background-secondary)')}
              >
                <LuSparkles style={{...inputIconStyle, color: agenticResearchDisabled ? 'var(--foreground-secondary)' : (isAgenticResearchToggled ? 'var(--accent-foreground)' : 'var(--foreground-secondary)')}} />
                <span style={{ color: 'var(--foreground)' }} className={`hidden sm:inline ml-2 text-sm`}>Agentic Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;