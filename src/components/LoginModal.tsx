"use client";

import { useState, useEffect, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { generateDeviceFingerprint } from '@/utils/deviceFingerprint';
import { loginUser, registerUser } from '@/utils/auth'; // Assuming your auth functions are here
import ForgotPasswordModal from '@/components/ForgotPasswordModal'; // Using path alias

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  isMet: boolean;
}

const baseInputStyle: CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--input-background)',
  borderWidth: '1px',
  borderColor: 'var(--input-border)', 
  borderRadius: '0.5rem',
  padding: '0.75rem 1rem',
  color: 'var(--input-foreground)',
  fontFamily: 'sans-serif',
  outline: 'none',
};

const focusedInputStyle: CSSProperties = {
  boxShadow: '0 0 0 2px var(--ring)',
};

const errorInputStyle: CSSProperties = {
  borderColor: 'var(--destructive)',
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState(''); // For general API errors
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', label: 'Minimum 8 characters', validator: (p) => p.length >= 8, isMet: false },
    { id: 'uppercase', label: 'Minimum 1 uppercase letter', validator: (p) => /[A-Z]/.test(p), isMet: false },
    { id: 'lowercase', label: 'Minimum 1 lowercase letter', validator: (p) => /[a-z]/.test(p), isMet: false },
    { id: 'number-symbol', label: 'Minimum 1 number or symbol', validator: (p) => /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p), isMet: false },
  ]);

  const allRequirementsMet = passwordRequirements.every(req => req.isMet);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  useEffect(() => {
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
    setUsernameError('');
    setPasswordError('');
    setApiError('');
    setShowPasswordRequirements(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordRequirements(prev => prev.map(req => ({ ...req, isMet: false })));
  }, [isLogin, isOpen]); // Reset when mode changes or modal reopens

  const validateEmail = (emailStr: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);

  const validatePasswordRequirements = (passStr: string) => {
    const updated = passwordRequirements.map(req => ({ ...req, isMet: req.validator(passStr) }));
    setPasswordRequirements(updated);
    return updated.every(req => req.isMet);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (val && !validateEmail(val)) setEmailError('Please enter a valid email address');
    else setEmailError('');
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsername(val);
    if (val && val.length < 3) setUsernameError('Username must be at least 3 characters');
    else if (val && val.length > 16) setUsernameError('Username cannot exceed 16 characters');
    else setUsernameError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordError(''); 

    if (val && val.length > 16) {
      setPasswordError('Password cannot exceed 16 characters');
      setShowPasswordRequirements(false);
      return;
    }
    
    const met = validatePasswordRequirements(val);
    if (!isLogin) setShowPasswordRequirements(!met);
    if (!isLogin && confirmPassword && val !== confirmPassword) setPasswordError('Passwords do not match');
    else if (passwordError === 'Passwords do not match') setPasswordError(''); // Clear if they now match
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (val !== password) setPasswordError('Passwords do not match');
    else setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError('');
    setEmailError('');
    setUsernameError('');
    setPasswordError('');

    let hasError = false;
    if (!email) { setEmailError('Email is required'); hasError = true; }
    else if (!validateEmail(email)) { setEmailError('Please enter a valid email address'); hasError = true; }

    if (!isLogin) {
      if (!username) { setUsernameError('Username is required'); hasError = true; }
      else if (username.length < 3) { setUsernameError('Username must be at least 3 characters'); hasError = true; }
      else if (username.length > 16) { setUsernameError('Username cannot exceed 16 characters'); hasError = true; }
    }

    if (!password) { setPasswordError('Password is required'); hasError = true; }
    else if (password.length > 16) { setPasswordError('Password cannot exceed 16 characters'); hasError = true; }

    if (!isLogin) {
      if (!validatePasswordRequirements(password)) {
        setPasswordError('Password does not meet all requirements');
        setShowPasswordRequirements(true);
        hasError = true;
      }
      if (password !== confirmPassword) { setPasswordError('Passwords do not match'); hasError = true; }
    }

    if (hasError) {
      setIsLoading(false);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await loginUser(email, password);
      } else {
        result = await registerUser(email, password, username);
      }

      if (result.success) {
        onClose(); // Close modal on success
        window.location.reload(); // Or use router to redirect / update state
      } else {
        setApiError(result.message || 'An unexpected error occurred.');
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleForgotPasswordSuccess = () => {
    setIsForgotPasswordOpen(false);
    setIsLogin(true); // Switch back to login view
    // Potentially show a success message that OTP email was sent
  };

  const handleBackToLogin = () => {
    setIsForgotPasswordOpen(false);
  };
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const styles = {
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 1050,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as CSSProperties,
    backdrop: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
    } as CSSProperties,
    modalContent: {
      position: 'relative',
      backgroundColor: 'var(--card-background)',
      border: '1px solid var(--card-border)',
      borderRadius: '0.75rem',
      width: '100%',
      maxWidth: '28rem',
      margin: '1rem',
      overflow: 'hidden',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    } as CSSProperties,
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      color: 'var(--foreground-secondary)',
      cursor: 'pointer',
    } as CSSProperties,
    closeButtonHover: {
      color: 'var(--foreground)',
    } as CSSProperties,
    contentPadding: { padding: '2rem' } as CSSProperties,
    headerContainer: { marginBottom: '2rem' } as CSSProperties,
    title: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: 'var(--foreground)',
      fontFamily: 'sans-serif',
      marginBottom: '1.5rem',
      textAlign: 'center',
    } as CSSProperties,
    tabContainer: {
      display: 'flex',
      justifyContent: 'center',
    } as CSSProperties,
    tabInnerContainer: {
      display: 'flex',
      backgroundColor: 'var(--secondary)',
      padding: '0.25rem',
      borderRadius: '0.5rem',
    } as CSSProperties,
    tabButton: (isActive: boolean) => ({
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      transition: 'all 0.3s',
      cursor: 'pointer',
      outline: 'none',
      backgroundColor: isActive ? 'var(--card-background)' : 'transparent',
      color: isActive ? 'var(--foreground)' : 'var(--foreground-secondary)',
      fontFamily: 'sans-serif',
    } as CSSProperties),
    form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' } as CSSProperties,
    label: {
      display: 'block',
      color: 'var(--foreground)',
      fontFamily: 'sans-serif',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
    } as CSSProperties,
    inputContainerRelative: { position: 'relative' } as CSSProperties,
    errorMessage: {
      color: 'var(--destructive)',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
    } as CSSProperties,
    passwordHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.25rem',
    } as CSSProperties,
    forgotPasswordButton: {
        fontSize: '0.75rem',
        color: 'var(--primary)',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
    } as CSSProperties,
    eyeButton: {
        position: 'absolute',
        right: '0.75rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--foreground-secondary)',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
    } as CSSProperties,
    requirementsBox: {
        marginTop: '0.5rem',
        padding: '0.75rem',
        backgroundColor: 'var(--secondary)',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
    } as CSSProperties,
    requirementsTitle: {
        fontSize: '0.875rem',
        color: 'var(--foreground)',
        marginBottom: '0.5rem',
        fontWeight: 500,
    } as CSSProperties,
    requirementsList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' } as CSSProperties,
    requirementItem: (isMet: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        color: isMet ? 'var(--success)' : 'var(--foreground-secondary)',
    } as CSSProperties),
    submitButton: {
      width: '100%',
      backgroundColor: 'var(--primary)',
      backdropFilter: 'blur(10px)',
      color: 'var(--primary-foreground)',
      fontFamily: 'sans-serif',
      fontWeight: 500,
      padding: '0.75rem 0',
      borderRadius: '0.5rem',
      border: '1px solid transparent',
      transition: 'all 0.3s',
      cursor: 'pointer',
      outline: 'none',
    } as CSSProperties,
    submitButtonHover: {
        backgroundColor: 'var(--primary-hover)',
    } as CSSProperties,
    switchAuthModeContainer: { marginTop: '1.5rem', textAlign: 'center' } as CSSProperties,
    switchAuthText: {
        color: 'var(--foreground-secondary)',
        fontFamily: 'sans-serif',
        fontSize: '0.875rem',
    } as CSSProperties,
    switchAuthButton: {
        color: 'var(--primary)',
        background: 'none',
        border: 'none',
        padding: 0,
        textDecoration: 'underline',
        cursor: 'pointer',
        outline: 'none',
    } as CSSProperties,
    apiError: {
      color: 'var(--destructive)',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      textAlign: 'center',
    } as CSSProperties,
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !isForgotPasswordOpen && (
          <div style={styles.modalOverlay}>
            <motion.div
              style={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            
            <motion.div
              style={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <button 
                onClick={onClose}
                style={styles.closeButton}
                onMouseEnter={(e) => (e.currentTarget.style.color = styles.closeButtonHover.color as string)}
                onMouseLeave={(e) => (e.currentTarget.style.color = (styles.closeButton as CSSProperties).color as string)}
              >
                <X size={24} />
              </button>
              
              <div style={styles.contentPadding}>
                <div style={styles.headerContainer}>
                  <h2 style={styles.title}>
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </h2>
                  
                  <div style={styles.tabContainer}>
                    <div style={styles.tabInnerContainer}>
                      <button
                        style={styles.tabButton(isLogin)}
                        onClick={() => setIsLogin(true)}
                      >
                        Login
                      </button>
                      <button
                        style={styles.tabButton(!isLogin)}
                        onClick={() => setIsLogin(false)}
                      >
                        Register
                      </button>
                    </div>
                  </div>
                </div>
                
                {apiError && <p style={styles.apiError}>{apiError}</p>}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? "login" : "register"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form style={styles.form} onSubmit={handleSubmit} noValidate>
                      <div>
                        <label style={styles.label} htmlFor="email">Email</label>
                        <input
                          id="email"
                          type="email"
                          style={{
                            ...baseInputStyle,
                            ...(emailError ? errorInputStyle : {}),
                            ...(emailFocused ? focusedInputStyle : {}),
                          }}
                          placeholder="your@email.com"
                          value={email}
                          onChange={handleEmailChange}
                          onFocus={() => setEmailFocused(true)}
                          onBlur={() => setEmailFocused(false)}
                        />
                        {emailError && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={styles.errorMessage}>{emailError}</motion.p>}
                      </div>
                      
                      {!isLogin && (
                        <div>
                          <label style={styles.label} htmlFor="username">Username</label>
                          <input
                            id="username"
                            type="text"
                            style={{
                                ...baseInputStyle,
                                ...(usernameError ? errorInputStyle : {}),
                                ...(usernameFocused ? focusedInputStyle : {}),
                            }}
                            placeholder="johndoe"
                            value={username}
                            onChange={handleUsernameChange}
                            maxLength={16}
                            onFocus={() => setUsernameFocused(true)}
                            onBlur={() => setUsernameFocused(false)}
                          />
                          {usernameError && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={styles.errorMessage}>{usernameError}</motion.p>}
                        </div>
                      )}
                      
                      <div>
                        <div style={styles.passwordHeader}>
                          <label style={styles.label} htmlFor="password">Password</label>
                          {isLogin && (
                            <button 
                              type="button"
                              onClick={() => setIsForgotPasswordOpen(true)}
                              style={styles.forgotPasswordButton}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = (styles.forgotPasswordButton as CSSProperties).color as string)}
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div style={styles.inputContainerRelative}>
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            style={{
                                ...baseInputStyle,
                                ...(passwordError ? errorInputStyle : {}),
                                ...(passwordFocused ? focusedInputStyle : {}),
                            }}
                            placeholder="••••••••"
                            value={password}
                            onChange={handlePasswordChange}
                            onFocus={() => {
                                setPasswordFocused(true);
                                if(!isLogin && !allRequirementsMet) setShowPasswordRequirements(true)
                            }}
                            onBlur={() => setPasswordFocused(false)}
                            maxLength={16}
                          />
                          <button
                            type="button"
                            style={styles.eyeButton}
                            onClick={togglePasswordVisibility}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = (styles.eyeButton as CSSProperties).color as string)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        
                        <AnimatePresence>
                          {!isLogin && showPasswordRequirements && !allRequirementsMet && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              style={styles.requirementsBox}
                            >
                              <h4 style={styles.requirementsTitle}>Password Requirements:</h4>
                              <ul style={styles.requirementsList}>
                                {passwordRequirements.map((req) => (
                                  <li key={req.id} style={styles.requirementItem(req.isMet)}>
                                    {req.isMet ? (
                                      <Check size={14} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                                    ) : (
                                      <AlertCircle size={14} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                                    )}
                                    <span>{req.label}</span>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                         {passwordError && !passwordError.includes("Passwords do not match") && !passwordError.includes("Password cannot exceed 16 characters") && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={styles.errorMessage}>{passwordError}</motion.p>
                        )}
                      </div>
                      
                      {!isLogin && (
                        <div>
                          <label style={styles.label} htmlFor="confirmPassword">Confirm Password</label>
                          <div style={styles.inputContainerRelative}>
                            <input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              style={{
                                ...baseInputStyle,
                                ...(passwordError && passwordError.includes("Passwords do not match") ? errorInputStyle : {}),
                                ...(confirmPasswordFocused ? focusedInputStyle : {}),
                              }}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={handleConfirmPasswordChange}
                              maxLength={16}
                              onFocus={() => setConfirmPasswordFocused(true)}
                              onBlur={() => setConfirmPasswordFocused(false)}
                            />
                            <button
                              type="button"
                              style={styles.eyeButton}
                              onClick={toggleConfirmPasswordVisibility}
                              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = (styles.eyeButton as CSSProperties).color as string)}
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {passwordError && passwordError.includes("Passwords do not match") && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={styles.errorMessage}>{passwordError}</motion.p>
                          )}
                        </div>
                      )}
                      
                      <button
                        type="submit"
                        style={isLoading ? {...styles.submitButton, opacity: 0.7, cursor: 'not-allowed'} : styles.submitButton}
                        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = (styles.submitButtonHover as CSSProperties).backgroundColor as string }}
                        onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = (styles.submitButton as CSSProperties).backgroundColor as string }}
                        disabled={isLoading}
                      >
                        {isLoading ? (isLogin ? 'Logging in...' : 'Creating Account...') : (isLogin ? "Login" : "Create Account")}
                      </button>
                    </form>
                  </motion.div>
                </AnimatePresence>
                
                <div style={styles.switchAuthModeContainer}>
                  <span style={styles.switchAuthText}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                      style={styles.switchAuthButton}
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

      <ForgotPasswordModal
        isOpen={isOpen && isForgotPasswordOpen}
        onClose={() => {
            setIsForgotPasswordOpen(false);
            // Do not call parent onClose if ForgotPasswordModal is closed, 
            // because LoginModal should remain open unless explicitly closed by its own X or successful action.
        }}
        onSuccess={handleForgotPasswordSuccess}
        onBackToLogin={handleBackToLogin}
      />
    </>
  );
} 