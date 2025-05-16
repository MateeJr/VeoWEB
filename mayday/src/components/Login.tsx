"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { generateDeviceFingerprint } from '@/utils/deviceFingerprint';
import ForgotPassword from './ForgotPassword';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  isMet: boolean;
}

export default function Login({ isOpen, onClose }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password requirements
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

  // Check if all password requirements are met
  const allRequirementsMet = passwordRequirements.every(req => req.isMet);

  // Forgot password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Reset form when switching between login and register
  useEffect(() => {
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
    setUsernameError('');
    setPasswordError('');
    setShowPasswordRequirements(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    // Reset password requirements
    setPasswordRequirements(prevRequirements => 
      prevRequirements.map(req => ({ ...req, isMet: false }))
    );
  }, [isLogin]);

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

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  // Handle username change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    if (value && value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
    } else if (value && value.length > 16) {
      setUsernameError('Username cannot exceed 16 characters');
    } else {
      setUsernameError('');
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Check password length limit first
    if (value && value.length > 16) {
      setPasswordError('Password cannot exceed 16 characters');
      return;
    }
    
    // Validate password requirements
    const requirementsMet = validatePasswordRequirements(value);
    
    // Only show requirements if not all are met
    if (!isLogin) {
      setShowPasswordRequirements(!requirementsMet);
    }
    
    // Check if passwords match for registration
    if (!isLogin && confirmPassword && value !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value !== password) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any existing errors
    setEmailError('');
    setUsernameError('');
    setPasswordError('');
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      return;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    // Validate username for registration
    if (!isLogin && !username) {
      setUsernameError('Username is required');
      return;
    } else if (!isLogin && username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    } else if (!isLogin && username.length > 16) {
      setUsernameError('Username cannot exceed 16 characters');
      return;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      return;
    } else if (password.length > 16) {
      setPasswordError('Password cannot exceed 16 characters');
      return;
    }
    
    // For registration, validate password requirements
    if (!isLogin) {
      const allRequirementsMet = validatePasswordRequirements(password);
      if (!allRequirementsMet) {
        setPasswordError('Password does not meet all requirements');
        setShowPasswordRequirements(true);
        return;
      }
    }
    
    // Validate confirm password for register
    if (!isLogin && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      // Generate device fingerprint
      const deviceFingerprint = generateDeviceFingerprint();
      
      let response;
      
      if (isLogin) {
        // Login
        console.log('Attempting login with:', email);
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, deviceFingerprint }),
        });
      } else {
        // Register
        console.log('Attempting registration with:', email, username);
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, username, deviceFingerprint }),
        });
      }
      
      // Parse response
      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error('Failed to parse response:', error);
        setPasswordError('Server returned invalid response. Please try again.');
        return;
      }

      if (response.ok && data.success) {
        // Successful login/register - reload page to show MainPage
        window.location.reload();
      } else {
        // Show error message
        const errorMessage = data.message || 'Authentication failed. Please try again.';
        
        if (errorMessage.toLowerCase().includes('email')) {
          setEmailError(errorMessage);
        } else if (errorMessage.toLowerCase().includes('username')) {
          setUsernameError(errorMessage);
        } else if (errorMessage.toLowerCase().includes('password')) {
          setPasswordError(errorMessage);
        } else {
          // Default to password error if can't determine which field
          setPasswordError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setPasswordError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
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

  // Handle forgot password success
  const handleForgotPasswordSuccess = () => {
    setIsForgotPasswordOpen(false);
    setIsLogin(true);
  };

  // Handle back to login from forgot password
  const handleBackToLogin = () => {
    setIsForgotPasswordOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isForgotPasswordOpen && (
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
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white cal-sans-regular mb-6 text-center">
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </h2>
                  
                  <div className="flex justify-center">
                    <div className="flex bg-white/10 p-1 rounded-lg">
                      <button
                        className={`px-4 py-2 rounded-md transition-all cursor-pointer focus:outline-none ${
                          isLogin 
                            ? "bg-white/20 text-white" 
                            : "text-gray-400 hover:text-white active:bg-white/10"
                        }`}
                        onClick={() => setIsLogin(true)}
                      >
                        Login
                      </button>
                      <button
                        className={`px-4 py-2 rounded-md transition-all cursor-pointer focus:outline-none ${
                          !isLogin 
                            ? "bg-white/20 text-white" 
                            : "text-gray-400 hover:text-white active:bg-white/10"
                        }`}
                        onClick={() => setIsLogin(false)}
                      >
                        Register
                      </button>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? "login" : "register"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-visible"
                  >
                    <form className="space-y-5" onSubmit={handleSubmit}>
                      <div>
                        <label className="block text-gray-300 cal-sans-regular mb-2 text-sm">Email</label>
                        <input
                          type="email"
                          className={`w-full bg-white/5 border ${emailError ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30`}
                          placeholder="your@email.com"
                          value={email}
                          onChange={handleEmailChange}
                        />
                        {emailError && (
                          <motion.p 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-red-500 text-sm mt-1"
                          >
                            {emailError}
                          </motion.p>
                        )}
                      </div>
                      
                      {!isLogin && (
                        <div>
                          <label className="block text-gray-300 cal-sans-regular mb-2 text-sm">Username</label>
                          <input
                            type="text"
                            className={`w-full bg-white/5 border ${usernameError ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30`}
                            placeholder="johndoe"
                            value={username}
                            onChange={handleUsernameChange}
                            maxLength={16}
                          />
                          {usernameError && (
                            <motion.p 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-red-500 text-sm mt-1"
                            >
                              {usernameError}
                            </motion.p>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <div className="flex justify-between items-center">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                            Password
                          </label>
                          {isLogin && (
                            <button 
                              type="button"
                              onClick={() => {
                                setIsForgotPasswordOpen(true);
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className={`w-full bg-white/5 border ${passwordError ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30`}
                            placeholder="••••••••"
                            value={password}
                            onChange={handlePasswordChange}
                            onFocus={() => !isLogin && !allRequirementsMet && setShowPasswordRequirements(true)}
                            maxLength={16}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        
                        {/* Password requirements for registration - only show if not all requirements met */}
                        <AnimatePresence>
                          {!isLogin && showPasswordRequirements && !allRequirementsMet && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 p-3 bg-white/5 border border-white/10 rounded-lg"
                            >
                              <h4 className="text-sm text-gray-300 mb-2 font-medium">Password Requirements:</h4>
                              <ul className="space-y-1">
                                {passwordRequirements.map((req) => (
                                  <li key={req.id} className="flex items-center text-sm">
                                    {req.isMet ? (
                                      <Check size={14} className="text-green-500 mr-2 flex-shrink-0" />
                                    ) : (
                                      <AlertCircle size={14} className="text-gray-500 mr-2 flex-shrink-0" />
                                    )}
                                    <span className={req.isMet ? 'text-green-500' : 'text-gray-400'}>
                                      {req.label}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {!isLogin && (
                        <div>
                          <label className="block text-gray-300 cal-sans-regular mb-2 text-sm">Confirm Password</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              className={`w-full bg-white/5 border ${passwordError ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white cal-sans-regular focus:outline-none focus:ring-2 focus:ring-white/30`}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={handleConfirmPasswordChange}
                              maxLength={16}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                              onClick={toggleConfirmPasswordVisibility}
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {passwordError && (
                            <motion.p 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-red-500 text-sm mt-1"
                            >
                              {passwordError}
                            </motion.p>
                          )}
                        </div>
                      )}
                      
                      <button
                        type="submit"
                        className="w-full bg-white/10 backdrop-blur-lg text-white cal-sans-regular font-medium py-3 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 focus:ring-4 focus:ring-white/30 focus:outline-none cursor-pointer"
                      >
                        {isLogin ? "Login" : "Create Account"}
                      </button>
                    </form>
                  </motion.div>
                </AnimatePresence>
                
                <div className="mt-6 text-center">
                  <span className="text-gray-400 cal-sans-regular text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                      className="text-white hover:underline focus:outline-none cursor-pointer"
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      {isLogin ? "Sign up" : "Log in"}
                    </button>
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <ForgotPassword
        isOpen={isOpen && isForgotPasswordOpen}
        onClose={onClose}
        onSuccess={handleForgotPasswordSuccess}
        onBackToLogin={handleBackToLogin}
      />
    </>
  );
} 