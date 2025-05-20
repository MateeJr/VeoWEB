'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX, LuMessageSquare, LuSearch, LuLoader } from 'react-icons/lu';
import { useAuth } from '../utils/auth';
import ConversationHistory from './ConversationHistory';
import { useRouter } from 'next/navigation';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isSmallScreen: boolean;
  onOpenLoginModal?: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, isSmallScreen, onOpenLoginModal }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { user, loggedIn, loading: authLoading } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Close panel on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle search query debouncing
  useEffect(() => {
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set searching state if query is not empty
    if (searchQuery.trim() !== '') {
      setIsSearching(true);
    }

    // Debounce search query
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectConversation = (conversationId: string) => {
    // Navigate to the chat page with the selected conversation
    router.push(`/chat/${conversationId}`);
    onClose();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setIsSearching(false);
  };

  const getTitleStyle = (): React.CSSProperties => ({
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 1rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--foreground)'
  });

  const getSearchInputStyle = (): React.CSSProperties => ({
    width: '100%',
    padding: '0.75rem',
    paddingLeft: '2.5rem',
    paddingRight: searchQuery ? '2.5rem' : '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--input-background)',
    color: 'var(--foreground)',
    marginBottom: '1rem',
    position: 'relative'
  });

  const getUserId = (): string => {
    if (authLoading) return '';
    return user?.createdAt?.toString() || `guest-${Date.now()}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            ref={panelRef}
            className="bg-white dark:bg-gray-900 w-full sm:w-96 h-full overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              backgroundColor: 'var(--background)',
              borderLeft: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Panel Header */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem', 
                borderBottom: '1px solid var(--border)'
              }}
            >
              <h2 style={getTitleStyle()}>
                <LuMessageSquare />
                <span>Chat History</span>
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  color: 'var(--foreground-secondary)'
                }}
                aria-label="Close history panel"
              >
                <LuX size={24} />
              </button>
            </div>
            
            {/* Panel Content */}
            <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
              {/* Search Input */}
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <LuSearch style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--foreground-secondary)',
                  pointerEvents: 'none'
                }} />
                
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={getSearchInputStyle()}
                />
                
                {isSearching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary animate-spin">
                    <LuLoader size={16} />
                  </span>
                )}
                
                {searchQuery && !isSearching && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground p-1 rounded-full hover:bg-secondary transition-colors"
                    aria-label="Clear search"
                  >
                    <LuX size={16} />
                  </button>
                )}
              </div>
              
              {/* Not logged in message */}
              {!authLoading && !loggedIn ? (
                <div style={{ 
                  padding: '1rem', 
                  textAlign: 'center',
                  color: 'var(--foreground-secondary)',
                  border: '1px dashed var(--border)',
                  borderRadius: '0.5rem',
                  marginTop: '1rem'
                }}>
                  <p style={{ marginBottom: '0.5rem' }}>Sign in to see your conversation history</p>
                  <button
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      marginTop: '0.5rem'
                    }}
                    onClick={() => {
                      onClose();
                      // Here you could trigger the login modal to open
                      if (onOpenLoginModal) {
                        onOpenLoginModal();
                      }
                    }}
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <ConversationHistory
                  userId={getUserId()}
                  onSelectConversation={handleSelectConversation}
                  searchQuery={debouncedSearchQuery}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HistoryPanel; 