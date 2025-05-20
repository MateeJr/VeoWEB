"use client";

import { useState, useEffect } from 'react';
import { listConversations, deleteConversation, searchConversationsContent } from '../utils/HistoryManager';
import type { ConversationHistory } from '../utils/HistoryManager';
import { MessageSquare, Trash, ChevronRight, Clock, MessageCircle } from 'lucide-react';

interface ConversationItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface ConversationHistoryProps {
  userId: string;
  onSelectConversation: (conversationId: string) => void;
  className?: string;
  searchQuery?: string;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  userId,
  onSelectConversation,
  className = '',
  searchQuery = ''
}) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup event listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load conversation list
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let conversationList: ConversationHistory[];
        
        if (searchQuery.trim()) {
          setIsSearching(true);
          conversationList = await searchConversationsContent(userId, searchQuery);
        } else {
          setIsSearching(false);
          conversationList = await listConversations(userId);
        }
        
        // Transform data to match ConversationItem type
        const transformedData = conversationList.map((conv: ConversationHistory): ConversationItem => ({
          id: conv.id,
          title: conv.title || 'Untitled Conversation',
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messageCount: conv.messages?.length || 0
        }));
        
        setConversations(transformedData);
      } catch (err) {
        console.error('Failed to load conversations:', err);
        setError('Failed to load conversation history');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversations();
  }, [userId, searchQuery]);

  // Delete a conversation
  const handleDelete = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the parent onClick
    
    try {
      const success = await deleteConversation(userId, conversationId);
      
      if (success) {
        // Remove from local state
        setConversations(conversations.filter(conv => conv.id !== conversationId));
      } else {
        setError('Failed to delete conversation');
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
    }
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`conversation-history ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <MessageSquare className="w-5 h-5" />
          <h2>Conversation History</h2>
        </div>
        {isSearching && (
          <div className="text-xs text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full">
            Search results
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-700 dark:border-neutral-300" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md">
          {error}
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-6 text-center text-neutral-500 dark:text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-900/50">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
          {searchQuery ? (
            <>
              <p>No matching conversations found.</p>
              <p className="text-sm mt-1">Try a different search term.</p>
            </>
          ) : (
            <>
              <p>No conversation history found.</p>
              <p className="text-sm mt-1">Start a new chat to begin.</p>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {conversations.map(conversation => (
            <li 
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className="flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors border border-neutral-200 dark:border-neutral-800 group"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{conversation.title}</div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(conversation.updatedAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => handleDelete(conversation.id, e)}
                  className={`p-1.5 rounded-full ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} hover:bg-red-100 dark:hover:bg-red-900/20 text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 transition-all`}
                  aria-label="Delete conversation"
                >
                  <Trash className="w-4 h-4" />
                </button>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConversationHistory; 