"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, ChevronUp, ChevronDown } from 'lucide-react';
import TextBoxButtons from '@/components/TextBoxButtons';

interface TextBoxProps {
  onSend: (message: string, searchEnabled: boolean) => void;
  onToggleAddMenu: (isOpen: boolean, position: { x: number, y: number }) => void;
  isAddMenuOpen: boolean;
  onSearchToggle: (enabled: boolean) => void;
}

export default function TextBox({ onSend, onToggleAddMenu, isAddMenuOpen, onSearchToggle }: TextBoxProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Auto-resize the textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height first to get accurate scrollHeight
      textarea.style.height = 'auto';
      
      // Get the line count
      const lineCount = input.split('\n').length;
      setHasOverflow(lineCount > 3 || textarea.scrollHeight > 24 * 3);
      
      // Set new height based on content (up to 3 lines when not expanded)
      if (!isExpanded) {
        const newHeight = Math.min(textarea.scrollHeight, 24 * 3); // Line height approx 24px * 3 lines
        textarea.style.height = `${newHeight}px`;
      } else {
        // When expanded, allow much larger height
        textarea.style.height = 'calc(100vh - 200px)';
      }
    }
  }, [input, isExpanded]);

  // Handle search toggle from TextBoxButtons
  const handleSearchToggle = (enabled: boolean) => {
    setIsSearchEnabled(enabled);
    // Call the parent component's onSearchToggle if provided
    if (onSearchToggle) {
      onSearchToggle(enabled);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input, isSearchEnabled);
      setInput('');
      setIsExpanded(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // On desktop: Enter submits, Shift+Enter adds new line
    // On mobile: Enter always adds new line, use Send button to submit
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full max-w-4xl px-4 relative">
      {hasOverflow && (
        <button
          onClick={toggleExpand}
          className="absolute -top-12 left-5 bg-black/50 text-white rounded-full p-2 z-10 backdrop-blur-sm border border-white/10 transition-all hover:bg-black/70 focus:outline-none cursor-pointer"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      )}
      
      <div className={`relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? 'expanded' : ''}`}>
        <form onSubmit={handleSubmit} className="flex items-center py-3">
          <div className="flex-1 px-4 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask VNYL"
              spellCheck="true"
              className="w-full bg-black/70 rounded-xl text-white outline-none placeholder:text-gray-400 text-lg resize-none transition-all duration-300 
              scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30 pr-2 pt-1 px-3 py-2"
              style={{ 
                minHeight: '24px', 
                maxHeight: isExpanded ? 'calc(100vh - 200px)' : '72px',
                overflowY: (hasOverflow && !isExpanded) || (isExpanded && input.length > 0) ? 'scroll' : 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
              }}
            />
          </div>
          <button
            type="submit"
            className="p-3 text-white hover:bg-white/10 transition-colors rounded-full mr-2 cursor-pointer"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </form>
        
        <div className="py-2">
          <TextBoxButtons 
            onToggleAddMenu={onToggleAddMenu}
            isAddMenuOpen={isAddMenuOpen}
            onSearchToggle={handleSearchToggle}
          />
        </div>
      </div>
    </div>
  );
} 