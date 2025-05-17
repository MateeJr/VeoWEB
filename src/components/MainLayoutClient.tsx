'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';
import GlobalLoadingScreen from '@/components/GlobalLoadingScreen';
import Header from './Header';
import { IncognitoProvider } from '../contexts/IncognitoContext';
import { ThemeProvider } from '../contexts/ThemeContext';

interface MainLayoutClientProps {
  children: React.ReactNode;
}

const MainLayoutClient: React.FC<MainLayoutClientProps> = ({ children }) => {
  const { loading: authLoading, user } = useAuth();
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  
  // Wait for authLoading to complete and then additional time to ensure UI is ready
  useEffect(() => {
    // Only proceed when auth is no longer loading
    if (!authLoading) {
      // Set a short delay to ensure the app is fully ready before showing content
      // This gives time for other components to initialize
      const timer = setTimeout(() => {
        setIsFullyLoaded(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading, user]);

  // Show loading screen until everything is fully loaded
  if (authLoading || !isFullyLoaded) {
    return <GlobalLoadingScreen />;
  }

  return (
    <ThemeProvider>
      <IncognitoProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flexGrow: 1, paddingTop: '72px' }}>
            {children}
          </main>
        </div>
      </IncognitoProvider>
    </ThemeProvider>
  );
};

export default MainLayoutClient; 