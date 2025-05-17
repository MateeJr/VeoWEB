// Re-export the ThemeContext for easier imports
export { useTheme, ThemeProvider, type ThemeMode } from '@/contexts/ThemeContext';

// Helper functions related to theme
export const getSystemTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  // Return light as default if not in browser
  return 'light';
}; 