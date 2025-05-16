"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import { changePassword } from '@/utils/auth';

interface ChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  isMet: boolean;
}

export default function ChangePassword({ isOpen, onClose, userEmail }: ChangePasswordProps) {
  // Form fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Error states
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Success state
  const [changeSuccess, setChangeSuccess] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password requirements
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    {
      id: 'length',
      label: 'Minimum 8 characters',
      validator: (password: string) => password.length >= 8,
      isMet: false,
    },
    {
      id: 'uppercase',
      label: 'Minimum 1 uppercase letter',
      validator: (password: string) => /[A-Z]/.test(password),
      isMet: false,
    },
    {
      id: 'lowercase',
      label: 'Minimum 1 lowercase letter',
      validator: (password: string) => /[a-z]/.test(password),
      isMet: false,
    },
    {
      id: 'number-symbol',
      label: 'Minimum 1 number or symbol',
      validator: (password: string) => /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      isMet: false,
    },
  ]);

  // Validate password meets all requirements
  const validatePasswordRequirements = (password: string) => {
    const updatedRequirements = passwordRequirements.map(req => ({
      ...req,
      isMet: req.validator(password)
    }));
    
    setPasswordRequirements(updatedRequirements);
    return updatedRequirements.every(req => req.isMet);
  };

  // Handle current password change
  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
    setCurrentPasswordError('');
  };

  // Handle new password change
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    
    // Check password length limit first
    if (value && value.length > 16) {
      setPasswordError('Password cannot exceed 16 characters');
      return;
    }
    
    // Validate password requirements
    const requirementsMet = validatePasswordRequirements(value);
    setShowPasswordRequirements(!requirementsMet);
    
    // Check if passwords match
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value !== newPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  // Toggle password visibility
  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle password change submission
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate current password
    if (!currentPassword) {
      setCurrentPasswordError('Current password is required');
      return;
    }
    
    // Validate new password
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    } else if (newPassword.length > 16) {
      setPasswordError('Password cannot exceed 16 characters');
      return;
    }
    
    // Check password requirements
    const allRequirementsMet = validatePasswordRequirements(newPassword);
    if (!allRequirementsMet) {
      setPasswordError('Password does not meet all requirements');
      setShowPasswordRequirements(true);
      return;
    }
    
    // Validate confirm password
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await changePassword(userEmail, currentPassword, newPassword);
      
      if (result.success) {
        setChangeSuccess(true);
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Auto close after success
        setTimeout(() => {
          onClose();
          setChangeSuccess(false);
        }, 2000);
      } else {
        if (result.message.toLowerCase().includes('current password')) {
          setCurrentPasswordError(result.message);
        } else {
          setPasswordError(result.message);
        }
      }
    } catch (error) {
      setPasswordError('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold text-white cal-sans-regular">
                  Change Your Password
                </h2>
              </div>
              
              <form onSubmit={handleChangePassword}>
                <p className="text-gray-300 mb-6">
                  Enter your current password and create a new one for your account.
                </p>
                
                <div className="space-y-5">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <Lock size={18} />
                      </span>
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={handleCurrentPasswordChange}
                        className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30"
                        placeholder="Enter current password"
                        disabled={isLoading || changeSuccess}
                        maxLength={16}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                        onClick={toggleCurrentPasswordVisibility}
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {currentPasswordError && (
                      <p className="mt-2 text-red-500 text-sm flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {currentPasswordError}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <Lock size={18} />
                      </span>
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30"
                        placeholder="Create a new password"
                        disabled={isLoading || changeSuccess}
                        maxLength={16}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                        onClick={toggleNewPasswordVisibility}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    
                    {/* Password Requirements */}
                    {showPasswordRequirements && (
                      <div className="mt-2 bg-white/5 p-3 rounded-lg">
                        <p className="text-sm text-gray-300 mb-2">Password must contain:</p>
                        <ul className="space-y-1">
                          {passwordRequirements.map(requirement => (
                            <li 
                              key={requirement.id} 
                              className={`text-xs flex items-center ${
                                requirement.isMet ? 'text-green-500' : 'text-gray-400'
                              }`}
                            >
                              {requirement.isMet ? (
                                <Check size={12} className="mr-1" />
                              ) : (
                                <div className="w-3 h-3 border border-gray-400 rounded-full mr-1"></div>
                              )}
                              {requirement.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <Lock size={18} />
                      </span>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30"
                        placeholder="Confirm your new password"
                        disabled={isLoading || changeSuccess}
                        maxLength={16}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="mt-2 text-red-500 text-sm flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {passwordError}
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || changeSuccess}
                    className={`w-full px-4 py-3 ${
                      changeSuccess 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    } backdrop-blur-lg cal-sans-regular font-medium rounded-lg border border-white/20 transition-all duration-300 focus:outline-none`}
                  >
                    {isLoading ? (
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    ) : changeSuccess ? (
                      <span className="flex items-center justify-center">
                        <Check size={18} className="mr-2" />
                        Password Changed Successfully
                      </span>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 