"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatMessage {
  id?: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatProps {
  messages: ChatMessage[];
  onEditMessage?: (id: string, newText: string) => void;
  onDeleteMessage?: (id: string) => void;
  onRegenerateMessage?: (id: string) => void;
}

// Function to parse formatted text
const parseFormattedText = (text: string): React.ReactNode[] => {
  const result: React.ReactNode[] = [];
  
  // First, pre-process text to replace URLs with placeholders
  const urlPlaceholders: {placeholder: string, url: string}[] = [];
  let urlCounter = 0;
  
  // We need to first identify markdown links to preserve them
  let markdownLinks: { fullMatch: string, text: string, url: string, index: number }[] = [];
  const markdownLinkRegex = /\[(.*?)\]\((.*?)\)/g;
  let mlMatch;
  while ((mlMatch = markdownLinkRegex.exec(text)) !== null) {
    markdownLinks.push({
      fullMatch: mlMatch[0],
      text: mlMatch[1],
      url: mlMatch[2],
      index: mlMatch.index
    });
  }
  
  // Replace markdown links with special placeholders
  let processedText = text;
  markdownLinks.forEach((link, index) => {
    const placeholder = `__MARKDOWN_LINK_${index}__`;
    processedText = processedText.replace(link.fullMatch, placeholder);
  });
  
  // Use a very aggressive URL regex pattern
  const urlRegex = /(https?:\/\/\S+|www\.\S+\.\S+)/g;
  
  // Replace all URLs with unique placeholders, but skip text that's already in a placeholder
  processedText = processedText.replace(urlRegex, (match, offset) => {
    // Check if this URL is inside an existing placeholder
    if (processedText.substring(Math.max(0, offset - 20), offset + match.length + 20).includes('__MARKDOWN_LINK_')) {
      // This URL is part of a markdown link, keep it as is
      return match;
    }
    
    const placeholder = `__URL_PLACEHOLDER_${urlCounter}__`;
    urlPlaceholders.push({
      placeholder,
      url: match.startsWith('www.') ? `https://${match}` : match
    });
    urlCounter++;
    return placeholder;
  });
  
  // Now process the text with URLs already replaced
  // Split text by newlines
  const lines = processedText.split('\n');
  
  // Track if we're in a code block
  let inCodeBlock = false;
  let codeContent = '';
  let codeBlockIndex = 0;
  
  // Track if we're in a quote block
  let inQuoteBlock = false;
  let quoteContent: React.ReactNode[] = [];
  let quoteBlockIndex = 0;
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    
    // Handle code blocks with triple backticks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // Start of code block
        inCodeBlock = true;
        codeBlockIndex = lineIndex;
        codeContent = '';
      } else {
        // End of code block
        inCodeBlock = false;
        result.push(
          <pre key={`code-block-${codeBlockIndex}`} className="bg-gray-800 p-2 rounded my-2 overflow-x-auto w-full text-gray-300 text-xs">
            <code>{codeContent}</code>
          </pre>
        );
      }
      continue;
    }
    
    if (inCodeBlock) {
      // Inside code block, collect content
      codeContent += (codeContent ? '\n' : '') + line;
      continue;
    }
    
    // Handle quote blocks
    if (line.trim().startsWith('> ')) {
      if (!inQuoteBlock) {
        // Start of quote block
        inQuoteBlock = true;
        quoteBlockIndex = lineIndex;
        quoteContent = [];
      }
      // Add to quote content
      const quoteText = line.trim().substring(2);
      quoteContent.push(...parseInlineFormatting(quoteText, urlPlaceholders));
      
      // Add line break if not the last line and next line is also a quote
      if (lineIndex < lines.length - 1 && lines[lineIndex + 1].trim().startsWith('> ')) {
        quoteContent.push(<br key={`quote-br-${lineIndex}`} />);
      }
      continue;
    } else if (inQuoteBlock) {
      // End of quote block
      inQuoteBlock = false;
      result.push(
        <blockquote key={`quote-${quoteBlockIndex}`} className="border-l-4 border-purple-500/50 pl-3 my-2 italic text-gray-300">
          {quoteContent}
        </blockquote>
      );
    }
    
    // Handle horizontal rule
    if (line.trim() === '---') {
      result.push(
        <hr key={`hr-${lineIndex}`} className="border-t border-gray-600 my-3" />
      );
      continue;
    }
    
    // Handle headings
    if (line.trim().startsWith('# ')) {
      const headingText = line.trim().substring(2);
      result.push(
        <h1 key={`h1-${lineIndex}`} className="text-xl font-bold mb-2 mt-3">
          {parseInlineFormatting(headingText, urlPlaceholders)}
        </h1>
      );
      continue;
    }
    
    if (line.trim().startsWith('## ')) {
      const headingText = line.trim().substring(3);
      result.push(
        <h2 key={`h2-${lineIndex}`} className="text-lg font-bold mb-2 mt-3">
          {parseInlineFormatting(headingText, urlPlaceholders)}
        </h2>
      );
      continue;
    }
    
    if (line.trim().startsWith('### ')) {
      const headingText = line.trim().substring(4);
      result.push(
        <h3 key={`h3-${lineIndex}`} className="text-md font-bold mb-1 mt-2">
          {parseInlineFormatting(headingText, urlPlaceholders)}
        </h3>
      );
      continue;
    }
    
    // Handle unordered list items
    if (line.trim().startsWith('- ')) {
      const listContent = line.trim().substring(2);
      
      // Handle checkboxes
      if (listContent.startsWith('[ ] ')) {
        result.push(
          <div key={`checkbox-${lineIndex}`} className="flex ml-2 mb-1 items-center">
            <div className="w-4 h-4 border border-gray-500 rounded mr-2 flex items-center justify-center">
              <span className="opacity-0">✓</span>
            </div>
            <span>{parseInlineFormatting(listContent.substring(4), urlPlaceholders)}</span>
          </div>
        );
      } else if (listContent.startsWith('[x] ')) {
        result.push(
          <div key={`checkbox-checked-${lineIndex}`} className="flex ml-2 mb-1 items-center">
            <div className="w-4 h-4 border border-purple-500 bg-purple-500/30 rounded mr-2 flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
            <span>{parseInlineFormatting(listContent.substring(4), urlPlaceholders)}</span>
          </div>
        );
      } else {
        result.push(
          <div key={`list-${lineIndex}`} className="flex ml-2 mb-1">
            <span className="mr-2">•</span>
            <span>{parseInlineFormatting(listContent, urlPlaceholders)}</span>
          </div>
        );
      }
      continue;
    }
    
    // Handle ordered list items (e.g., "1. Item")
    const orderedListMatch = line.trim().match(/^(\d+)\.\s(.+)$/);
    if (orderedListMatch) {
      const [, number, content] = orderedListMatch;
      result.push(
        <div key={`ordered-list-${lineIndex}`} className="flex ml-2 mb-1">
          <span className="mr-2 min-w-[1.5rem]">{number}.</span>
          <span>{parseInlineFormatting(content, urlPlaceholders)}</span>
        </div>
      );
      continue;
    }
    
    // Handle normal text with inline formatting
    if (line.trim() !== '') {
      result.push(
        <div key={`line-${lineIndex}`} className="mb-1">
          {parseInlineFormatting(line, urlPlaceholders)}
        </div>
      );
    } else if (lineIndex < lines.length - 1) {
      // Add empty line except for the last line if it's empty
      result.push(<div key={`empty-${lineIndex}`} className="mb-3">&nbsp;</div>);
    }
  }
  
  // Handle any remaining quote block at the end
  if (inQuoteBlock) {
    result.push(
      <blockquote key={`quote-${quoteBlockIndex}`} className="border-l-4 border-purple-500/50 pl-3 my-2 italic text-gray-300">
        {quoteContent}
      </blockquote>
    );
  }
  
  // Handle any remaining code block at the end
  if (inCodeBlock) {
    result.push(
      <pre key={`code-block-${codeBlockIndex}`} className="bg-gray-800 p-2 rounded my-2 overflow-x-auto w-full text-gray-300 text-xs">
        <code>{codeContent}</code>
      </pre>
    );
  }
  
  return result;
};

// Handle inline formatting like bold text
const parseInlineFormatting = (text: string, urlPlaceholders: {placeholder: string, url: string}[]): React.ReactNode[] => {
  if (!text) return [];
  
  // First, we'll identify all formatting tokens and split the text into segments
  const segments: Array<{ type: string; content: string; index: number; url?: string }> = [];
  let plainText = '';
  
  // This function finds all types of formatting in a single pass
  const findFormatting = () => {
    // Reset
    segments.length = 0;
    plainText = text;
    
    // Find all bold segments (surrounded by **)
    let boldMatch;
    const boldRegex = /\*\*(.*?)\*\*/g;
    while ((boldMatch = boldRegex.exec(text)) !== null) {
      segments.push({
        type: 'bold',
        content: boldMatch[1],
        index: boldMatch.index
      });
    }
    
    // Find all italic segments (surrounded by *)
    let italicMatch;
    const italicRegex = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g;
    while ((italicMatch = italicRegex.exec(text)) !== null) {
      segments.push({
        type: 'italic',
        content: italicMatch[1],
        index: italicMatch.index
      });
    }
    
    // Find strikethrough
    let strikeMatch;
    const strikeRegex = /~~(.*?)~~/g;
    while ((strikeMatch = strikeRegex.exec(text)) !== null) {
      segments.push({
        type: 'strike',
        content: strikeMatch[1],
        index: strikeMatch.index
      });
    }
    
    // Find inline code
    let codeMatch;
    const codeRegex = /`(.*?)`/g;
    while ((codeMatch = codeRegex.exec(text)) !== null) {
      segments.push({
        type: 'code',
        content: codeMatch[1],
        index: codeMatch.index
      });
    }
    
    // Find double quotes for highlighting
    let quoteMatch;
    const quoteRegex = /"([^"]+)"/g;
    while ((quoteMatch = quoteRegex.exec(text)) !== null) {
      segments.push({
        type: 'highlight',
        content: quoteMatch[1],
        index: quoteMatch.index
      });
    }
    
    // Find URL placeholders and add them as segments
    for (const placeholder of urlPlaceholders) {
      let placeholderIndex = text.indexOf(placeholder.placeholder);
      while (placeholderIndex !== -1) {
        segments.push({
          type: 'url',
          content: placeholder.placeholder,
          url: placeholder.url,
          index: placeholderIndex
        });
        placeholderIndex = text.indexOf(placeholder.placeholder, placeholderIndex + 1);
      }
    }
    
    // Find links
    let linkMatch;
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    while ((linkMatch = linkRegex.exec(text)) !== null) {
      segments.push({
        type: 'link',
        content: linkMatch[1],
        url: linkMatch[2],
        index: linkMatch.index
      });
    }
    
    // Sort segments by their starting position in the text
    segments.sort((a, b) => a.index - b.index);
  };
  
  findFormatting();
  
  // Convert segments to React elements
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let skipUntilIndex: number | null = null;
  
  // Process segments in order
  for (const segment of segments) {
    // Skip this segment if it's in a region we're skipping
    if (skipUntilIndex !== null && segment.index < skipUntilIndex) {
      continue;
    }
    skipUntilIndex = null;
    
    // Add any text before this segment
    if (segment.index > lastIndex) {
      result.push(text.substring(lastIndex, segment.index));
    }
    
    // Get the full length of this segment including markers
    let segmentLength = 0;
    
    // Add the formatted segment
    switch (segment.type) {
      case 'bold':
        result.push(
          <strong key={`bold-${segment.index}`} className="cal-sans-regular">
            {parseInlineFormatting(segment.content, urlPlaceholders)}
          </strong>
        );
        segmentLength = segment.content.length + 4; // +4 for '**' at both ends
        break;
      case 'italic':
        result.push(
          <em key={`italic-${segment.index}`} className="montserrat-italic">
            {parseInlineFormatting(segment.content, urlPlaceholders)}
          </em>
        );
        segmentLength = segment.content.length + 2; // +2 for '*' at both ends
        break;
      case 'strike':
        result.push(
          <del key={`strike-${segment.index}`}>
            {parseInlineFormatting(segment.content, urlPlaceholders)}
          </del>
        );
        segmentLength = segment.content.length + 4; // +4 for '~~' at both ends
        break;
      case 'code':
        result.push(
          <code key={`code-${segment.index}`} className="bg-gray-800 px-1 rounded text-xs">
            {segment.content}
          </code>
        );
        segmentLength = segment.content.length + 2; // +2 for '`' at both ends
        break;
      case 'highlight':
        result.push(
          <span key={`highlight-${segment.index}`} className="relative inline-block">
            <motion.span 
              className="relative z-10"
              initial={{ color: "rgb(229 231 235)" }}
              animate={{ color: "#000" }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              "{segment.content}"
            </motion.span>
            <motion.span 
              className="absolute bottom-0 left-0 w-full h-full bg-yellow-300/80 rounded-lg"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.4, delay: 0.1 }}
            />
          </span>
        );
        segmentLength = segment.content.length + 2; // +2 for double quotes
        break;
      case 'url':
        if (segment.url) {
          result.push(
            <a 
              key={`url-${segment.index}`} 
              href={segment.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline font-medium bg-purple-400/10 px-2 py-0.5 rounded"
              title={segment.url}
            >
              🔗 link
            </a>
          );
          segmentLength = segment.content.length;
        }
        break;
      case 'link':
        if (segment.url) {
          result.push(
            <a 
              key={`link-${segment.index}`} 
              href={segment.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              {parseInlineFormatting(segment.content, urlPlaceholders)}
            </a>
          );
          segmentLength = segment.content.length + segment.url.length + 4; // +4 for '[]()'
        }
        break;
    }
    
    // Update lastIndex to skip past this formatted segment
    lastIndex = segment.index + segmentLength;
    
    // Skip any segments that would overlap with this one
    skipUntilIndex = lastIndex;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }
  
  return result;
};

export default function Chat({ 
  messages, 
  onEditMessage = () => {}, 
  onDeleteMessage = () => {}, 
  onRegenerateMessage = () => {} 
}: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEdit = (message: ChatMessage) => {
    if (!message.id) return;
    setEditingMessageId(message.id);
    setEditText(message.text);
  };

  const handleSaveEdit = (id: string | undefined) => {
    if (!id) return;
    onEditMessage(id, editText);
    setEditingMessageId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  const handleDelete = (id: string | undefined) => {
    if (!id) return;
    onDeleteMessage(id);
  };

  const handleRegenerate = (id: string | undefined) => {
    if (!id) return;
    onRegenerateMessage(id);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl px-4 flex-1 overflow-hidden flex flex-col">
      <div 
        className="flex-1 overflow-y-auto pr-2 pb-4"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
          overflowY: 'scroll'
        }}
      >
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`flex flex-col mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className={message.isUser 
                ? 'max-w-[80%] rounded-xl px-4 py-3 bg-purple-500/20 text-white border border-purple-500/30'
                : 'max-w-[80%] px-4 py-1 text-white'
              }
            >
              {message.id === editingMessageId ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-purple-500/10 border border-purple-500/30 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 montserrat-regular"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => handleCancelEdit()} 
                      className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleSaveEdit(message.id)} 
                      className="text-xs px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm montserrat-regular">
                  {parseFormattedText(message.text)}
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className={`flex mt-1 gap-1 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              {message.isUser && (
                <>
                  <button 
                    onClick={() => handleEdit(message)}
                    className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                    title="Edit message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(message.id)}
                    className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                    title="Delete message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => handleRegenerate(message.id)}
                    className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                    title="Regenerate response"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                    </svg>
                  </button>
                </>
              )}
              
              {!message.isUser && (
                <button 
                  onClick={() => handleDelete(message.id)}
                  className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                  title="Delete message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 