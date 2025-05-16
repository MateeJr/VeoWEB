"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowLeft, Eye, EyeOff, Mail, AlertCircle, Info } from 'lucide-react';
import { requestPasswordReset, resetPasswordWithOTP } from '@/utils/auth';

interface ForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  isMet: boolean;
}

export default function ForgotPassword({ isOpen, onClose, onSuccess, onBackToLogin }: ForgotPasswordProps) {
  // Step management: 1 = request OTP, 2 = verify OTP and reset password
  const [step, setStep] = useState(1);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Success states
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
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

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setEmailError('');
      setOtpError('');
      setPasswordError('');
      setRequestSuccess(false);
      setResetSuccess(false);
      setShowPasswordRequirements(false);
      setPasswordRequirements(prevReqs => 
        prevReqs.map(req => ({ ...req, isMet: false }))
      );
    }
  }, [isOpen]);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password meets all requirements
  const validatePasswordRequirements = (password: string) => {
    const updatedRequirements = passwordRequirements.map(req => ({
      ...req,
      isMet: req.validator(password)
    }));
    
    setPasswordRequirements(updatedRequirements);
    return updatedRequirements.every(req => req.isMet);
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  // Handle OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
    
    if (value && value.length !== 6) {
      setOtpError('Verification code must be 6 digits');
    } else {
      setOtpError('');
    }
  };

  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    
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

  // Handle confirm password input change
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
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Request password reset OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      return;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await requestPasswordReset(email);
      
      if (result.success) {
        setRequestSuccess(true);
        setTimeout(() => {
          setStep(2);
        }, 1500);
      } else {
        setEmailError(result.message);
        setRequestSuccess(false);
      }
    } catch (error) {
      setEmailError('Failed to send verification code. Please try again.');
      setRequestSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OTP
    if (!otp) {
      setOtpError('Verification code is required');
      return;
    } else if (otp.length !== 6) {
      setOtpError('Verification code must be 6 digits');
      return;
    }
    
    // Validate password
    if (!newPassword) {
      setPasswordError('Password is required');
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
      const result = await resetPasswordWithOTP(email, otp, newPassword);
      
      if (result.success) {
        setResetSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setOtpError(result.message);
      }
    } catch (error) {
      setOtpError('Failed to reset password. Please try again.');
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
                {step === 2 && (
                  <button 
                    onClick={() => setStep(1)} 
                    className="mr-3 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h2 className="text-2xl font-bold text-white cal-sans-regular">
                  {step === 1 ? 'Reset Your Password' : 'Verify & Create New Password'}
                </h2>
              </div>
              
              {/* Step 1: Request OTP */}
              {step === 1 && (
                <form onSubmit={handleRequestOTP}>
                  <p className="text-gray-300 mb-6">
                    Enter your email address and we'll send you a verification code to reset your password.
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Mail size={18} />
                        </span>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30"
                          placeholder="you@example.com"
                          disabled={isLoading || requestSuccess}
                        />
                      </div>
                      {emailError && (
                        <p className="mt-2 text-red-500 text-sm flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {emailError}
                        </p>
                      )}
                    </div>
                    
                    {requestSuccess && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start text-sm text-blue-400">
                        <Info size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                        <p>
                          <span className="font-medium">Verification code sent!</span> Please check your inbox. 
                          If you don't receive it within a few minutes, please check your spam/junk folder.
                        </p>
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isLoading || requestSuccess}
                      className={`w-full px-4 py-3 ${
                        requestSuccess 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      } backdrop-blur-lg cal-sans-regular font-medium rounded-lg border border-white/20 transition-all duration-300 focus:outline-none relative overflow-hidden`}
                    >
                      {isLoading ? (
                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      ) : requestSuccess ? (
                        <span className="flex items-center justify-center">
                          <Check size={18} className="mr-2" />
                          Verification Code Sent
                        </span>
                      ) : emailError ? (
                        'Try Again'
                      ) : (
                        'Send Verification Code'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={onBackToLogin}
                      className="w-full text-sm text-center text-gray-400 hover:text-white transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              )}
              
              {/* Step 2: Verify OTP and Reset Password */}
              {step === 2 && (
                <form onSubmit={handleResetPassword}>
                  <p className="text-gray-300 mb-6">
                    Enter the verification code sent to <strong>{email}</strong> and create a new password.
                  </p>
                  
                  <div className="space-y-5">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start text-sm text-blue-400">
                      <Info size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                      <p>
                        <span className="font-medium">Didn't receive the code?</span> Please check your spam/junk folder or request a new code by going back.
                      </p>
                    </div>
                  
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-1">
                        Verification Code
                      </label>
                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={handleOtpChange}
                        className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30 tracking-widest text-center"
                        placeholder="6-digit code"
                        maxLength={6}
                        disabled={isLoading || resetSuccess}
                      />
                      {otpError && (
                        <p className="mt-2 text-red-500 text-sm flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {otpError}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30 pr-10"
                          placeholder="Create a new password"
                          disabled={isLoading || resetSuccess}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30 pr-10"
                          placeholder="Confirm your new password"
                          disabled={isLoading || resetSuccess}
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
                      disabled={isLoading || resetSuccess}
                      className={`w-full px-4 py-3 ${
                        resetSuccess 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      } backdrop-blur-lg cal-sans-regular font-medium rounded-lg border border-white/20 transition-all duration-300 focus:outline-none`}
                    >
                      {isLoading ? (
                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      ) : resetSuccess ? (
                        <span className="flex items-center justify-center">
                          <Check size={18} className="mr-2" />
                          Password Reset Successfully
                        </span>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 