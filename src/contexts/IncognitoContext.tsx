'use client';

import React,
{ createContext,
  useState,
  useContext,
  ReactNode,
  useMemo // Import useMemo
} from 'react';

interface IncognitoContextType {
  isIncognitoMode: boolean;
  toggleIncognitoMode: () => void;
}

const IncognitoContext = createContext<IncognitoContextType | undefined>(undefined);

export const IncognitoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isIncognitoMode, setIsIncognitoMode] = useState(false);

  const toggleIncognitoMode = () => {
    setIsIncognitoMode(prevMode => !prevMode);
  };

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    isIncognitoMode,
    toggleIncognitoMode,
  }), [isIncognitoMode]);

  return (
    <IncognitoContext.Provider value={contextValue}>
      {children}
    </IncognitoContext.Provider>
  );
};

export const useIncognito = (): IncognitoContextType => {
  const context = useContext(IncognitoContext);
  if (context === undefined) {
    throw new Error('useIncognito must be used within an IncognitoProvider');
  }
  return context;
}; 