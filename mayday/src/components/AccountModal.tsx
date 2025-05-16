"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, User as UserIcon, LogOut, Edit, Clock, Key } from 'lucide-react';
import { logoutUser, getCurrentUserProfile } from '@/utils/auth';
import { formatRelativeTime, formatFullDate } from '@/utils/formatTime';
import ChangePassword from './ChangePassword';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

interface UserProfile {
  email: string;
  username?: string;
  deviceFingerprint?: string;
  createdAt?: number;
}

export default function AccountModal({ isOpen, onClose, userEmail }: AccountModalProps) {
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const result = await getCurrentUserProfile();
      if (result.success && result.user) {
        const user = result.user as UserProfile;
        setUsername(user.username || '');
        setNewUsername(user.username || '');
        setCreatedAt(user.createdAt || null);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (newUsername.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (newUsername.trim().length > 16) {
      setError('Username cannot exceed 16 characters');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userEmail,
          username: newUsername.trim() 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUsername(newUsername.trim());
        setIsEditing(false);
        setSuccess('Username updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.message || 'Failed to update username');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setError('Failed to update username. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isChangePasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            
            <motion.div
              className="relative bg-black/90 border border-white/20 rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
              
              <div className="p-8">
                <div className="mb-8 text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon size={40} className="text-white/70" />
                  </div>
                  <h2 className="text-3xl font-bold text-white cal-sans-regular mb-2">
                    Account
                  </h2>
                  <p className="text-gray-400">{userEmail}</p>
                  
                  {createdAt && (
                    <div className="mt-2 flex items-center justify-center text-gray-500 text-sm">
                      <Clock size={14} className="mr-1" />
                      <span title={formatFullDate(createdAt)}>
                        Account created {formatRelativeTime(createdAt)}
                      </span>
                    </div>
                  )}
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse text-gray-400">Loading account data...</div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-gray-300 font-medium">Username</h3>
                        {!isEditing && (
                          <button 
                            onClick={() => setIsEditing(true)} 
                            className="text-gray-400 hover:text-white cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30"
                            placeholder="Enter new username"
                            maxLength={16}
                          />
                          {error && <p className="text-red-500 text-sm">{error}</p>}
                          <div className="flex space-x-2">
                            <button 
                              onClick={handleUpdateUsername}
                              disabled={isLoading}
                              className="px-4 py-2 bg-white/10 backdrop-blur-lg text-white cal-sans-regular font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 focus:outline-none cursor-pointer flex-1"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => {
                                setIsEditing(false);
                                setNewUsername(username);
                                setError('');
                              }}
                              className="px-4 py-2 bg-black text-white cal-sans-regular font-medium rounded-lg border border-white/10 hover:bg-gray-900 transition-all duration-300 focus:outline-none cursor-pointer flex-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-white text-lg">{username || 'No username set'}</p>
                          {success && (
                            <p className="text-green-500 text-sm mt-1">{success}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="w-full px-4 py-3 bg-white/10 text-white cal-sans-regular font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 focus:outline-none cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Key size={18} />
                        <span>Change Password</span>
                      </button>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 bg-red-500/10 text-red-500 cal-sans-regular font-medium rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 focus:outline-none cursor-pointer flex items-center justify-center gap-2"
                      >
                        <LogOut size={18} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <ChangePassword
        isOpen={isOpen && isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userEmail={userEmail}
      />
    </>
  );
} 