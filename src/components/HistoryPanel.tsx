'use client';

import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX, LuMessageSquare, LuSearch, LuLoader, LuTrash2, LuTriangle } from 'react-icons/lu';
import { useAuth } from '../utils/auth';
import ConversationHistory from './ConversationHistory';
import { useRouter } from 'next/navigation';
import { deleteAllConversations } from '../utils/HistoryManager';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isSmallScreen: boolean;
  onOpenLoginModal?: () => void;
  headerHeight?: string;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, isSmallScreen, onOpenLoginModal, headerHeight = '72px' }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { user, loggedIn, loading: authLoading } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Close panel on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDeleteConfirmation) {
          setShowDeleteConfirmation(false);
        } else {
          onClose();
        }
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose, showDeleteConfirmation]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        if (showDeleteConfirmation) {
          // Don't close the panel if delete confirmation is showing
          return;
        }
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, showDeleteConfirmation]);

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

  const handleDeleteAllClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user?.createdAt) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const userId = user.createdAt.toString();
      const success = await deleteAllConversations(userId);
      
      setDeleteSuccess(success);
      if (success) {
        // Force refresh the conversations list
        setDebouncedSearchQuery('');
        // Increment refresh key to force component remount
        setRefreshKey(prev => prev + 1);
      } else {
        setDeleteError('Failed to delete conversations');
      }
    } catch (error) {
      console.error('Error deleting all conversations:', error);
      setDeleteSuccess(false);
      setDeleteError('An error occurred while deleting conversations');
    } finally {
      setIsDeleting(false);
      // Hide confirmation modal after a delay
      setTimeout(() => {
        setShowDeleteConfirmation(false);
        setDeleteSuccess(null);
      }, 2000);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteSuccess(null);
    setDeleteError(null);
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

  // Function to force refresh the conversation list
  const forceRefreshConversations = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => {
    const styles = {
      modalOverlay: { position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' } as CSSProperties,
      backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)' } as CSSProperties,
      modalContent: { position: 'relative', backgroundColor: 'var(--card-background)', border: '1px solid var(--destructive)', borderRadius: '0.75rem', width: 'auto', maxWidth: '28rem', margin: '1rem', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.1)' } as CSSProperties,
      closeButton: { position: 'absolute', top: '1rem', right: '1rem', color: 'var(--foreground-secondary)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' } as CSSProperties,
      titleContainer: { display: 'flex', alignItems: 'center', color: 'var(--destructive)', marginBottom: '1rem' } as CSSProperties,
      titleIcon: { marginRight: '0.75rem' } as CSSProperties,
      title: { fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'sans-serif', color: 'var(--destructive)', margin: 0 } as CSSProperties,
      warningText: { color: 'var(--foreground-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: 1.6 } as CSSProperties,
      errorMessage: { color: 'var(--destructive)', fontSize: '0.875rem', marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem' } as CSSProperties,
      buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' } as CSSProperties,
      cancelButton: { padding: '0.75rem 1rem', backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', fontFamily: 'sans-serif', fontWeight: 500, borderRadius: '0.5rem', border: '1px solid var(--border)', transition: 'all 0.3s', cursor: 'pointer' } as CSSProperties,
      confirmButton: { padding: '0.75rem 1rem', backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)', fontFamily: 'sans-serif', fontWeight: 500, borderRadius: '0.5rem', border: '1px solid transparent', transition: 'all 0.3s', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: isDeleting ? 0.7 : 1 } as CSSProperties,
      successContainer: { textAlign: 'center', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' } as CSSProperties,
      successIcon: { color: 'var(--success)', flexShrink: 0 } as CSSProperties,
      successText: { fontSize: '1.125rem', fontWeight: 500, color: 'var(--foreground)', margin: 0 } as CSSProperties
    };
    
    return (
      <div style={styles.modalOverlay}>
        <motion.div 
          style={styles.backdrop} 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={isDeleting ? undefined : handleDeleteCancel} 
        />
        <motion.div 
          style={styles.modalContent} 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.9, opacity: 0 }} 
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {!isDeleting && !deleteSuccess && (
            <button 
              onClick={handleDeleteCancel} 
              style={styles.closeButton}
              onMouseEnter={(e) => e.currentTarget.style.color = '#111827'} 
              onMouseLeave={(e) => e.currentTarget.style.color = (styles.closeButton as CSSProperties).color as string}
            >
              <LuX size={24} />
            </button>
          )}
          
          <div style={styles.titleContainer}>
            <LuTriangle size={32} style={styles.titleIcon} />
            <h2 style={styles.title}>Delete All Conversations</h2>
          </div>
          
          {!deleteSuccess ? (
            <>
              <p style={styles.warningText}>
                Are you sure you want to delete all your chat history? This action cannot be undone.
              </p>
              
              {deleteError && (
                <div style={styles.errorMessage}>
                  {deleteError}
                </div>
              )}
              
              <div style={styles.buttonGroup}>
                <button
                  onClick={handleDeleteCancel}
                  style={styles.cancelButton}
                  disabled={isDeleting}
                  onMouseEnter={(e) => { if (!isDeleting) e.currentTarget.style.backgroundColor = '#e5e7eb'}}
                  onMouseLeave={(e) => { if (!isDeleting) e.currentTarget.style.backgroundColor = (styles.cancelButton as CSSProperties).backgroundColor as string}}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  style={styles.confirmButton}
                  disabled={isDeleting}
                  onMouseEnter={(e) => { if (!isDeleting) e.currentTarget.style.backgroundColor = '#dc2626'}}
                  onMouseLeave={(e) => { if (!isDeleting) e.currentTarget.style.backgroundColor = (styles.confirmButton as CSSProperties).backgroundColor as string}}
                >
                  {isDeleting ? (
                    <>
                      <LuLoader className="animate-spin mr-2" size={16} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <LuTrash2 style={{ marginRight: '0.5rem' }} size={16} />
                      Delete All
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div style={styles.successContainer}>
              <div style={styles.successIcon}>
                <motion.svg 
                  width="38" 
                  height="38" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </motion.svg>
              </div>
              <p style={styles.successText}>All conversations deleted successfully!</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          key="history-panel"
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
              flexDirection: 'column',
              height: `calc(100% - ${headerHeight})`,
              marginTop: headerHeight,
              position: 'absolute',
              top: 0,
              right: 0,
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
              <div className="flex items-center">
                {!authLoading && loggedIn && (
                  <button
                    onClick={handleDeleteAllClick}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      color: 'var(--foreground-secondary)',
                      marginRight: '0.5rem'
                    }}
                    aria-label="Delete all conversations"
                    title="Delete all conversations"
                  >
                    <LuTrash2 size={20} />
                  </button>
                )}
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
                  key={refreshKey}
                  userId={getUserId()}
                  onSelectConversation={handleSelectConversation}
                  searchQuery={debouncedSearchQuery}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <DeleteConfirmationModal key="delete-confirmation-modal" />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default HistoryPanel; 