"use client";

import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { LuPaperclip, LuGlobe, LuLightbulb, LuSquarePen, LuSparkles, LuMaximize2, LuMinimize2, LuVideo, LuMic, LuSend, LuSearch, LuTrash2, LuCopy, LuCheck, LuThumbsUp, LuThumbsDown, LuRefreshCw } from 'react-icons/lu';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../utils/auth';

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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  const baseContainerClasses = [
    "flex", "flex-col", "w-full", "border", "border-gray-300", "rounded-[2rem]",
    "overflow-hidden", "bg-white", "transition-shadow", "duration-300", "relative"
  ];
  let dynamicContainerClasses = [...baseContainerClasses];
  if (isMobile && isTextareaFocused) {
    dynamicContainerClasses.push("shadow-lg");
  } else {
    dynamicContainerClasses.push("shadow-none", "hover:shadow-lg");
  }

  const commonBlackButtonStyle = "w-9 h-9 rounded-full bg-black flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors duration-200 active:scale-95 cursor-pointer";

  const shimmerTextStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    color: '#333',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #333, #777, #333)',
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

  return (
    <>
      <Tooltip 
        id="chatbox-tooltip" 
        style={{ 
          zIndex: 9999, 
          borderRadius: '8px', 
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)' 
        }} 
        variant="light"
      />
      <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-6 md:px-8">
        <div className="text-center mb-4 flex flex-col">
          <div 
            style={{
              display: 'block',
              marginBottom: '-1rem',
              color: '#333',
              fontWeight: 'bold'
            }} 
            className="text-2xl"
          >
            Hello,{' '}
            <span style={shimmerTextStyle}>
              {authLoading ? "User" : (loggedIn && user ? (user.username || (user.email ? user.email.split('@')[0] : 'I am Veo')) : 'I am Veo')}
            </span>
            .
          </div>
          <br />
          <div 
            style={{
              display: 'block',
              color: '#333',
              fontWeight: 'bold'
            }} 
            className="text-2xl"
          >
            How can I help you today?
          </div>
        </div>
        <div className="w-full md:w-[800px]">
          <div className={dynamicContainerClasses.join(' ')}>
            {(isTextareaExpanded || textareaValue.trim().length > 0) && (
              <button
                type="button"
                onClick={() => setIsTextareaExpanded(!isTextareaExpanded)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-gray-200 active:scale-90 transition-all"
                aria-label={isTextareaExpanded ? "Collapse textarea" : "Expand textarea"}
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content={isTextareaExpanded ? "Collapse" : "Expand"}
                data-tooltip-place="top"
              >
                {isTextareaExpanded ? (
                  <LuMinimize2 className="w-4 h-4 text-gray-600" />
                ) : (
                  <LuMaximize2 className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
            <textarea
              className="w-full p-4 focus:outline-none resize-none bg-transparent pr-24"
              rows={isTextareaExpanded ? 8 : 1}
              placeholder="Ask me anything..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              onFocus={() => setIsTextareaFocused(true)}
              onBlur={() => setIsTextareaFocused(false)}
            />
            <div className="absolute bottom-4 right-4 flex items-center space-x-2">
              <button
                type="button"
                className={commonBlackButtonStyle}
                aria-label="Start video input"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Start video input"
                data-tooltip-place="top"
              >
                <LuVideo className="w-5 h-5 text-white" />
              </button>
              <button
                type="button"
                className={commonBlackButtonStyle}
                aria-label="Send"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Send Message"
                data-tooltip-place="top"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
                </svg>
              </button>
            </div>
            <div className="w-full p-4 flex items-center space-x-2">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-200 transition-colors transition-transform duration-200 ring-1 ring-gray-300 cursor-pointer active:scale-90"
                aria-label="New Chat"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="New Chat"
                data-tooltip-place="top"
              >
                <LuSquarePen className="w-5 h-5 text-gray-600" />
              </button>
              <button
                type="button"
                disabled={paperclipDisabled}
                className={`p-2 rounded-full transition-colors transition-transform duration-200 ring-1 ring-gray-300 active:scale-90 ${
                  paperclipDisabled
                    ? 'opacity-50 cursor-not-allowed bg-gray-100'
                    : 'hover:bg-gray-200 cursor-pointer'
                }`}
                aria-label="Attach file"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Attach Files"
                data-tooltip-place="top"
              >
                <LuPaperclip className={`w-5 h-5 ${paperclipDisabled ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              <button
                type="button"
                onClick={handleSearchToggle}
                disabled={searchDisabled}
                className={`p-2 sm:px-4 sm:py-2 rounded-full transition-colors transition-transform duration-200 flex items-center active:scale-95 ${
                  searchDisabled
                    ? 'opacity-50 cursor-not-allowed ring-1 ring-gray-300 bg-gray-100'
                    : isSearchToggled
                      ? 'bg-sky-100 hover:bg-sky-200 ring-1 ring-sky-500 cursor-pointer'
                      : 'hover:bg-gray-200 ring-1 ring-gray-300 cursor-pointer'
                }`}
                aria-label="Search"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Always Browse the web"
                data-tooltip-place="top"
              >
                <LuGlobe className={`w-5 h-5 transition-colors ${searchDisabled ? 'text-gray-400' : isSearchToggled ? 'text-sky-700' : 'text-gray-600'}`} />
                <span className={`hidden sm:inline ml-2 text-sm transition-colors ${searchDisabled ? 'text-gray-400' : isSearchToggled ? 'text-sky-700' : 'text-gray-700'}`}>Search</span>
              </button>
              <button
                type="button"
                onClick={handleReasonToggle}
                disabled={reasonDisabled}
                className={`p-2 sm:px-4 sm:py-2 rounded-full transition-colors transition-transform duration-200 flex items-center active:scale-95 ${
                  reasonDisabled
                    ? 'opacity-50 cursor-not-allowed ring-1 ring-gray-300 bg-gray-100'
                    : isReasonToggled
                      ? 'bg-sky-100 hover:bg-sky-200 ring-1 ring-sky-500 cursor-pointer'
                      : 'hover:bg-gray-200 ring-1 ring-gray-300 cursor-pointer'
                }`}
                aria-label="Reason"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Think before responding"
                data-tooltip-place="top"
              >
                <LuLightbulb className={`w-5 h-5 transition-colors ${reasonDisabled ? 'text-gray-400' : isReasonToggled ? 'text-sky-700' : 'text-gray-600'}`} />
                <span className={`hidden sm:inline ml-2 text-sm transition-colors ${reasonDisabled ? 'text-gray-400' : isReasonToggled ? 'text-sky-700' : 'text-gray-700'}`}>Reason</span>
              </button>
              <button
                type="button"
                onClick={handleAgenticResearchToggle}
                disabled={agenticResearchDisabled}
                className={`p-2 sm:px-4 sm:py-2 rounded-full transition-colors transition-transform duration-200 flex items-center active:scale-95 ${
                  agenticResearchDisabled
                    ? 'opacity-50 cursor-not-allowed ring-1 ring-gray-300 bg-gray-100'
                    : isAgenticResearchToggled
                      ? 'bg-sky-100 hover:bg-sky-200 ring-1 ring-sky-500 cursor-pointer'
                      : 'hover:bg-gray-200 ring-1 ring-gray-300 cursor-pointer'
                }`}
                aria-label="Agentic Search"
                data-tooltip-id="chatbox-tooltip"
                data-tooltip-content="Smart Web Search ~ BETA"
                data-tooltip-place="top"
              >
                <LuSparkles className={`w-5 h-5 transition-colors ${agenticResearchDisabled ? 'text-gray-400' : isAgenticResearchToggled ? 'text-sky-700' : 'text-gray-600'}`} />
                <span className={`hidden sm:inline ml-2 text-sm transition-colors ${agenticResearchDisabled ? 'text-gray-400' : isAgenticResearchToggled ? 'text-sky-700' : 'text-gray-700'}`}>Agentic Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBox; 