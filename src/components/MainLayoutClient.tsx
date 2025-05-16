'use client';

import React from 'react';
import { useAuth } from '@/utils/auth';
import GlobalLoadingScreen from '@/components/GlobalLoadingScreen';

interface MainLayoutClientProps {
  children: React.ReactNode;
}

const MainLayoutClient: React.FC<MainLayoutClientProps> = ({ children }) => {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return <GlobalLoadingScreen />;
  }

  return <>{children}</>;
};

export default MainLayoutClient; 