'use client';

import React from "react";
import ChatBox from "@/components/ChatBox";
import { useAuth } from "@/utils/auth";

export default function Home() {
  const { loading } = useAuth();
  
  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <main style={{ backgroundColor: 'var(--background)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: 'var(--background)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ChatBox />
    </main>
  );
}
