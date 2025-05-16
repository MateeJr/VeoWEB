'use client';

import React, { CSSProperties } from 'react';

const loadingScreenStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: '#000000', // Black background
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 99999, // Ensure it's on top of everything
  color: '#FFFFFF', // White text
  fontFamily: 'sans-serif',
  fontSize: '1.5rem',
  textAlign: 'center',
  padding: '1rem',
};

const spinnerStyle: CSSProperties = {
  border: '4px solid rgba(255, 255, 255, 0.3)',
  borderTop: '4px solid #FFFFFF',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  animation: 'spin 1s linear infinite',
  marginBottom: '20px',
};

const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const GlobalLoadingScreen = () => {
  return (
    <div style={loadingScreenStyle}>
      <style>{keyframes}</style> {/* Inject keyframes directly */}
      <div style={spinnerStyle}></div>
      <p>Loading user data...</p>
      <p style={{ fontSize: '1rem', marginTop: '10px', color: '#AAAAAA' }}>
        Please wait a moment.
      </p>
    </div>
  );
};

export default GlobalLoadingScreen; 