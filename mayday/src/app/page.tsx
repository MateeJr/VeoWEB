"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Login from '@/components/Login';
import MainPage from '@/components/MainPage';
import { isUserLoggedIn, getLoggedInUserEmail, verifyDeviceAndLoginStatus, logoutUser } from '@/utils/auth';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  
  // Check login status and verify device on page load
  useEffect(() => {
    const verifyAuthStatus = async () => {
      setIsLoading(true);
      
      try {
        const loggedIn = isUserLoggedIn();
        
        if (loggedIn) {
          // Verify the device fingerprint
          const deviceVerified = await verifyDeviceAndLoginStatus();
          
          if (!deviceVerified) {
            // If device doesn't match, log the user out
            console.log('Device verification failed, logging out');
            logoutUser();
            setIsLoggedIn(false);
          } else {
            // Device is verified, set logged in state
            setIsLoggedIn(true);
            const email = getLoggedInUserEmail();
            if (email) {
              setUserEmail(email);
            }
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuthStatus();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-white cal-sans-regular mb-4">VNYL</h1>
        <div className="animate-pulse text-gray-400">Verifying session...</div>
      </div>
    );
  }

  // If user is logged in, show MainPage component
  if (isLoggedIn) {
    return <MainPage user={{ email: userEmail }} />;
  }

  // Otherwise, show landing page with login option
  return (
    <div className="min-h-screen flex flex-col items-center pt-5">
      <h1 className="text-3xl font-bold text-white cal-sans-regular">VNYL</h1>
      <div className="text-center mt-35 mb-12 px-6 md:px-0">
        <motion.h2 
          className="text-5xl md:text-6xl font-bold text-white cal-sans-regular mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          All-in-One AI Experience
        </motion.h2>
        <motion.p 
          className="text-base md:text-xl text-gray-300 cal-sans-regular max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Unlock your full potential with a seamless platform built to power{" "}
          <span className="relative inline-block">
            <motion.span 
              className="relative z-10"
              initial={{ color: "rgb(209 213 219)" }}
              animate={{ color: "#000" }}
              transition={{ duration: 0.3, delay: 1.4 }}
            >
              productivity, ignite creativity,
            </motion.span>
            <motion.span 
              className="absolute bottom-0 left-0 w-full h-full bg-yellow-300/80 rounded-lg"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 1.2 }}
            />
          </span>
          {" "}and bring everything you need into one intelligent space.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mt-10 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <button 
            className="px-6 py-3 w-40 bg-white/10 backdrop-blur-lg text-white cal-sans-regular font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 focus:ring-4 focus:ring-white/30 focus:outline-none shadow-lg cursor-pointer"
            onClick={() => setIsLoginOpen(true)}
          >
            Get Started
          </button>
          <button className="px-6 py-3 w-40 bg-black text-white cal-sans-regular font-medium rounded-lg border border-white/10 hover:bg-gray-900 transition-all duration-300 hover:scale-110 focus:ring-4 focus:ring-white/20 focus:outline-none cursor-pointer">
            Documentation
          </button>
        </motion.div>
      </div>

      <Login 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </div>
  );
}
