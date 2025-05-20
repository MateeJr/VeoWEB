'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/utils/auth';
import ChatBox from '@/components/ChatBox';
import { loadConversation } from '@/utils/HistoryManager';
import type { ConversationHistory } from '@/utils/HistoryManager';

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage() {
  // Use useParams hook to get the params safely
  const params = useParams();
  const conversationId = params.id as string;
  
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationHistory | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      if (loading) return;

      if (!conversationId) {
        setError('No conversation ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const userId = user?.createdAt?.toString() || `guest-${Date.now()}`;
        const loadedConversation = await loadConversation(userId, conversationId);
        
        if (loadedConversation) {
          setConversation(loadedConversation);
        } else {
          setError('Conversation not found');
        }
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId, loading, user]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 max-w-md w-full text-center">
          {error}
        </div>
        <button 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          onClick={() => router.push('/')}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <ChatBox initialConversation={conversation} />
    </main>
  );
} 