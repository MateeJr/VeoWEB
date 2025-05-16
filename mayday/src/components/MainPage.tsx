"use client";

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { User } from 'lucide-react';
import { getCurrentUserProfile } from '@/utils/auth';
import AccountModal from './AccountModal';
import TextBox from './TextBox';
import AddMenu from './AddMenu';
import Chat from './Chat';

interface UserProps {
  email: string;
  username?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function MainPage({ user }: { user: UserProps }) {
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [addMenu, setAddMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 }
  });
  // Add state to track search enabled status globally
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  
  const handleToggleAddMenu = (isOpen: boolean, position: { x: number, y: number }) => {
    setAddMenu({ isOpen, position });
  };

  // Handle search toggle from TextBox
  const handleSearchToggle = (enabled: boolean) => {
    setIsSearchEnabled(enabled);
  };
  
  useEffect(() => {
    // Fetch latest user data from account.json only once on page load
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const result = await getCurrentUserProfile();
        if (result.success && result.user) {
          // Use the latest username from account.json
          if (result.user.username) {
            setDisplayName(result.user.username);
          } else {
            // Fallback to email if no username
            setDisplayName(result.user.email.split('@')[0]);
          }
        } else {
          // Fallback to props if API call fails
          setDisplayName(user.username || user.email.split('@')[0]);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Fallback to props
        setDisplayName(user.username || user.email.split('@')[0]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
    
  }, [user.email, user.username]);

  // Add a useEffect to adjust the viewport height for mobile and prevent scrolling
  useEffect(() => {
    const setAppHeight = () => {
      // Set a CSS variable for the real viewport height
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Initial height set
    setAppHeight();
    
    // Update on resize
    window.addEventListener('resize', setAppHeight);
    return () => {
      window.removeEventListener('resize', setAppHeight);
      // Reset body styles when component unmounts
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  // Generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Handle sending a new message
  const handleSendMessage = async (message: string, searchEnabled: boolean = false) => {
    // Update global search state
    setIsSearchEnabled(searchEnabled);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      text: message,
      isUser: true,
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Call VNYL API
    setIsResponding(true);
    
    try {
      // Prepare chat history for API
      const history = newMessages.map(msg => ({
        isUser: msg.isUser,
        text: msg.text
      }));
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          history: history.slice(0, -1), // All messages except the latest user message
          searchEnabled: searchEnabled // Pass the search state to the API
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add AI response
      const botMessage: ChatMessage = {
        id: generateId(),
        text: data.response || "Sorry, I couldn't generate a response. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error('Error calling VNYL API:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: generateId(),
        text: "I'm having trouble connecting to my brain. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsResponding(false);
    }
  };

  // Handle editing a message
  const handleEditMessage = (id: string, newText: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === id 
          ? { ...msg, text: newText } 
          : msg
      )
    );
  };

  // Handle deleting a message
  const handleDeleteMessage = (id: string) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== id));
  };

  // Handle clearing all messages for new chat
  const handleNewChat = () => {
    setMessages([]);
    setAddMenu(prev => ({ ...prev, isOpen: false }));
  };

  // Handle regenerating a message
  const handleRegenerateMessage = async (id: string) => {
    // Find the message to regenerate
    const messageToRegenerate = messages.find(msg => msg.id === id);
    if (!messageToRegenerate || !messageToRegenerate.isUser) return;

    // Get the index of the message
    const messageIndex = messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) return;

    // Keep messages up to and including the user message to regenerate
    const updatedMessages = messages.slice(0, messageIndex + 1);
    setMessages(updatedMessages);
    
    // Call VNYL API again with updated history
    setIsResponding(true);
    
    try {
      const history = updatedMessages.map(msg => ({
        isUser: msg.isUser,
        text: msg.text
      }));
      
      // Use the current global search toggle state
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: messageToRegenerate.text,
          history: history.slice(0, -1), // All messages except the latest user message
          searchEnabled: isSearchEnabled // Use the global search state
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add new AI response
      const botMessage: ChatMessage = {
        id: generateId(),
        text: data.response || "Sorry, I couldn't generate a response. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      console.error('Error regenerating response:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: generateId(),
        text: "I'm having trouble regenerating a response. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsResponding(false);
    }
  };

  // Close add menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (addMenu.isOpen) {
        setAddMenu(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [addMenu.isOpen]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)', position: 'fixed', inset: 0 }}>
        <h1 className="text-3xl font-bold text-white cal-sans-regular mb-4">VNYL</h1>
        <div className="animate-pulse text-gray-400">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)', position: 'fixed', inset: 0 }}>
      <header className="w-full flex justify-between items-center px-6 md:px-12 pt-5">
        <h1 className="text-3xl font-bold text-white cal-sans-regular">VNYL</h1>
        <button 
          onClick={() => setIsAccountModalOpen(true)}
          className="w-10 h-10 bg-white/10 backdrop-blur-lg text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 focus:outline-none cursor-pointer border border-white/20"
          aria-label="Account"
        >
          <User size={20} />
        </button>
      </header>
      
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-center px-6 md:px-0" style={{ marginTop: '-15%' }}>
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-white cal-sans-regular"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Hi, <span className="text-purple-400">
              {displayName}
            </span>!
          </motion.h2>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 w-full flex flex-col items-center overflow-hidden mt-6">
          <Chat 
            messages={messages}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onRegenerateMessage={handleRegenerateMessage}
          />
          
          {isResponding && (
            <div className="w-full max-w-4xl px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-pulse">VNYL is thinking</div>
                <div className="flex">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '200ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '400ms' }}>.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <motion.div 
        className="mt-auto w-full flex justify-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <TextBox 
          onSend={handleSendMessage} 
          onToggleAddMenu={handleToggleAddMenu}
          isAddMenuOpen={addMenu.isOpen}
          onSearchToggle={handleSearchToggle}
        />
      </motion.div>
      
      {addMenu.isOpen && (
        <AddMenu 
          isOpen={addMenu.isOpen}
          position={addMenu.position}
          onNewChat={handleNewChat}
        />
      )}
      
      {isAccountModalOpen && (
        <AccountModal 
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          userEmail={user.email}
        />
      )}
    </div>
  );
} 