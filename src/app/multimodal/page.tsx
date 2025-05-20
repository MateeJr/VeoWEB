"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import { LuFlipHorizontal, LuX, LuCamera, LuScreenShare } from 'react-icons/lu';

const MultimodalPage = () => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeMode, setActiveMode] = useState<'none' | 'camera' | 'screen'>('none');
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Clean up media stream when component unmounts or mode changes
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Your browser does not support camera access.');
      return;
    }
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment'
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaStreamRef.current = stream;
      setActiveMode('camera');
    } catch (error: any) {
      if (error && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
        setErrorMsg('Camera access was denied. Please allow camera permission in your browser settings.');
      } else if (error && error.name === 'NotFoundError') {
        setErrorMsg('No camera device found.');
      } else {
        setErrorMsg('Could not access camera. Please check permissions and try again.');
      }
      console.error('Error accessing camera:', error);
    }
  };

  const shareScreen = async () => {
    setErrorMsg(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setErrorMsg('Your browser does not support screen sharing.');
      return;
    }
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      // @ts-ignore - TypeScript might not recognize getDisplayMedia
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaStreamRef.current = stream;
      setActiveMode('screen');
    } catch (error: any) {
      if (error && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
        setErrorMsg('Screen sharing was denied. Please allow permission in your browser settings.');
      } else {
        setErrorMsg('Could not share screen. Please check permissions and try again.');
      }
      console.error('Error sharing screen:', error);
    }
  };

  const stopStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActiveMode('none');
  };

  const flipCamera = () => {
    setIsFrontCamera(!isFrontCamera);
    if (activeMode === 'camera') {
      // Restart camera with new facing mode
      startCamera();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-8">
      {/* Smaller circle at the top center - with theme adaptive styling */}
      <div className="w-32 h-32 rounded-full border-4 border-foreground bg-transparent dark:bg-foreground/10 flex items-center justify-center shadow-lg" />

      {/* Preview Box */}
      <div className="relative mt-8 w-full max-w-3xl aspect-video bg-background-secondary rounded-xl overflow-hidden border border-border shadow-lg">
        {activeMode === 'none' && !errorMsg && (
          <div className="absolute inset-0 flex items-center justify-center text-foreground-secondary">
            Preview will appear here
          </div>
        )}
        {errorMsg && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-background/80 z-10 px-4 text-center">
            {errorMsg}
          </div>
        )}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className={`w-full h-full object-cover ${activeMode === 'none' ? 'hidden' : ''}`}
        />
        {/* Flip camera button - only shown when camera is active */}
        {activeMode === 'camera' && (
          <button 
            onClick={flipCamera}
            className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-md hover:bg-background transition-colors"
            aria-label="Flip camera"
          >
            <LuFlipHorizontal className="text-foreground w-5 h-5" />
          </button>
        )}
        {/* Close button - only shown when stream is active */}
        {activeMode !== 'none' && (
          <button 
            onClick={stopStream}
            className="absolute top-4 left-4 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-md hover:bg-background transition-colors"
            aria-label="Stop stream"
          >
            <LuX className="text-foreground w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Control Buttons */}
      <div className="mt-8 flex space-x-4">
        <button
          onClick={shareScreen}
          disabled={activeMode === 'screen'}
          className={`
            flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all transform 
            shadow-md hover:shadow-lg active:scale-95 font-medium
            ${activeMode === 'screen'
              ? 'bg-primary/40 text-primary-foreground/70 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-primary-dark text-primary-foreground hover:brightness-110'
            }
          `}
        >
          <LuScreenShare className="w-5 h-5" />
          <span>Share Screen</span>
        </button>
        <button
          onClick={startCamera}
          disabled={activeMode === 'camera'}
          className={`
            flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all transform 
            shadow-md hover:shadow-lg active:scale-95 font-medium
            ${activeMode === 'camera'
              ? 'bg-primary/40 text-primary-foreground/70 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-primary-dark text-primary-foreground hover:brightness-110'
            }
          `}
        >
          <LuCamera className="w-5 h-5" />
          <span>Open Camera</span>
        </button>
      </div>
      
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="mt-6 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm"
      >
        Back to Chat
      </button>
    </div>
  );
};

export default MultimodalPage; 