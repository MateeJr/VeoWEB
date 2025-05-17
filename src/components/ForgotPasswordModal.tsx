"use client";

import { useState, useEffect, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowLeft, Eye, EyeOff, Mail, AlertCircle, Info } from 'lucide-react';
import { requestPasswordReset, resetPasswordWithOTP } from '@/utils/auth';

interface ForgotPasswordModalProps {
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

// Shared styles (can be moved to a common file if used elsewhere)
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


export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  onBackToLogin,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');

  const [requestSuccess, setRequestSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', label: 'Minimum 8 characters', validator: (p) => p.length >= 8, isMet: false },
    { id: 'uppercase', label: 'Minimum 1 uppercase', validator: (p) => /[A-Z]/.test(p), isMet: false },
    { id: 'lowercase', label: 'Minimum 1 lowercase', validator: (p) => /[a-z]/.test(p), isMet: false },
    { id: 'numberSymbol', label: 'Minimum 1 number or symbol', validator: (p) => /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p), isMet: false },
  ]);

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
      setApiError('');
      setRequestSuccess(false);
      setResetSuccess(false);
      setIsLoading(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setShowPasswordRequirements(false);
      setPasswordRequirements(prev => prev.map(req => ({ ...req, isMet: false })));
    } else {
      // Clear errors when closing, but keep email if user might reopen soon (optional)
      // setEmailError(''); 
      // setOtpError('');
      // setPasswordError('');
      // setApiError('');
    }
  }, [isOpen]);

  const validateEmail = (emailStr: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);

  const validatePasswordFn = (passStr: string) => {
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

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(val);
    if (val && val.length !== 6) setOtpError('Verification code must be 6 digits');
    else setOtpError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
    const met = validatePasswordFn(val);
    setShowPasswordRequirements(!met);
    if (confirmPassword && val !== confirmPassword) setPasswordError('Passwords do not match');
    else if (passwordError === 'Passwords do not match') setPasswordError('');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (val !== newPassword) setPasswordError('Passwords do not match');
    else setPasswordError('');
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setEmailError('Email is required'); return; }
    if (!validateEmail(email)) { setEmailError('Please enter a valid email address'); return; }
    
    setIsLoading(true); setApiError(''); setEmailError('');
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setRequestSuccess(true);
        setTimeout(() => {
          setStep(2);
          setRequestSuccess(false); // Reset for if user goes back
        }, 1500);
      } else {
        setApiError(result.message || 'Failed to send verification code.');
      }
    } catch (err) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    if (!otp) { setOtpError('Verification code is required'); hasError = true; }
    else if (otp.length !== 6) { setOtpError('Verification code must be 6 digits'); hasError = true; }
    if (!newPassword) { setPasswordError('Password is required'); hasError = true; }
    else if (!validatePasswordFn(newPassword)) {
      setPasswordError('Password does not meet all requirements');
      setShowPasswordRequirements(true);
      hasError = true;
    }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); hasError = true; }

    if (hasError) return;

    setIsLoading(true); setApiError(''); setOtpError(''); setPasswordError('');
    try {
      const result = await resetPasswordWithOTP(email, otp, newPassword);
      if (result.success) {
        setResetSuccess(true);
        setTimeout(() => {
          onSuccess(); // This should navigate back to login and potentially show a success message there
        }, 1500);
      } else {
        setApiError(result.message || 'Failed to reset password.');
      }
    } catch (err) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const styles = {
    modalOverlay: { position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' } as CSSProperties,
    backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' } as CSSProperties,
    modalContent: { position: 'relative', backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border)', borderRadius: '0.75rem', width: '100%', maxWidth: '28rem', margin: '1rem', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' } as CSSProperties,
    closeButton: { position: 'absolute', top: '1rem', right: '1rem', color: 'var(--foreground-secondary)', cursor: 'pointer' } as CSSProperties,
    closeButtonHover: { color: 'var(--foreground)' } as CSSProperties,
    contentPadding: { padding: '2rem' } as CSSProperties,
    headerContainer: { display: 'flex', alignItems: 'center', marginBottom: '1.5rem' } as CSSProperties,
    backButton: { marginRight: '0.75rem', color: 'var(--foreground-secondary)', background: 'none', border: 'none', cursor: 'pointer' } as CSSProperties,
    title: { fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--foreground)', fontFamily: 'sans-serif' } as CSSProperties,
    paragraph: { color: 'var(--foreground-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' } as CSSProperties,
    formSpaceY: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as CSSProperties, // space-y-6 for step 1
    formSpaceYStep2: { display: 'flex', flexDirection: 'column', gap: '1.25rem' } as CSSProperties, // space-y-5 for step 2
    label: { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '0.25rem' } as CSSProperties,
    inputIconContainer: { position: 'relative' } as CSSProperties,
    inputIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--foreground-secondary)',
      display: 'flex',
      alignItems: 'center',
    } as CSSProperties,
    inputWithIcon: { ...baseInputStyle, paddingLeft: '2.5rem' } as CSSProperties,
    otpInput: { ...baseInputStyle, letterSpacing: '0.25em', textAlign: 'center' } as CSSProperties,
    errorMessage: { marginTop: '0.5rem', color: 'var(--destructive)', fontSize: '0.875rem', display: 'flex', alignItems: 'center' } as CSSProperties,
    infoBox: { backgroundColor: 'var(--accent)', border: '1px solid var(--accent-foreground)', borderRadius: '0.5rem', padding: '0.75rem', display: 'flex', alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--accent-foreground)' } as CSSProperties,
    infoIcon: { marginRight: '0.5rem', flexShrink: 0, marginTop: '0.125rem' } as CSSProperties,
    submitButton: (isSuccess: boolean) => ({
      width: '100%', padding: '0.75rem 1rem',
      backgroundColor: isSuccess ? 'var(--success)' : 'var(--primary)',
      color: isSuccess ? 'var(--success-foreground)' : 'var(--primary-foreground)',
      fontFamily: 'sans-serif', fontWeight: 500, borderRadius: '0.5rem',
      border: '1px solid transparent',
      transition: 'all 0.3s', cursor: 'pointer', outline: 'none',
      position: 'relative', overflow: 'hidden',
      opacity: isLoading ? 0.7 : 1,
    } as CSSProperties),
    submitButtonHover: (isSuccess: boolean) => ({ backgroundColor: isSuccess ? 'var(--success-hover)' : 'var(--primary-hover)' }),
    loadingSpinner: { display: 'inline-block', height: '1.25rem', width: '1.25rem', animation: 'spin 1s linear infinite', borderRadius: '9999px', border: '2px solid white', borderTopColor: 'transparent' } as CSSProperties,
    buttonTextWithIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as CSSProperties,
    backToLoginButton: { width: '100%', fontSize: '0.875rem', textAlign: 'center', color: 'var(--foreground-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0' } as CSSProperties,
    eyeButton: { position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', color: 'var(--foreground-secondary)', background: 'none', border: 'none', cursor: 'pointer' } as CSSProperties,
    apiGlobalError: { marginTop: '0.5rem', color: 'var(--destructive)', fontSize: '0.875rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' } as CSSProperties,
    requirementsBox: { marginTop: '0.5rem', backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem' } as CSSProperties,
    requirementsTitle: { fontSize: '0.875rem', color: 'var(--foreground)', marginBottom: '0.5rem' } as CSSProperties,
    requirementsList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' } as CSSProperties,
    requirementItem: (isMet: boolean) => ({ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: isMet ? 'var(--success)' : 'var(--foreground-secondary)' } as CSSProperties),
    requirementIconMet: { marginRight: '0.25rem' } as CSSProperties,
    requirementIconNotMet: { width: '0.75rem', height: '0.75rem', border: '1px solid var(--border)', borderRadius: '9999px', marginRight: '0.25rem' } as CSSProperties,
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={styles.modalOverlay}>
          <motion.div style={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div style={styles.modalContent} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", duration: 0.5 }}>
            <button onClick={onClose} style={styles.closeButton} onMouseEnter={(e) => e.currentTarget.style.color = styles.closeButtonHover.color as string} onMouseLeave={(e) => e.currentTarget.style.color = (styles.closeButton as CSSProperties).color as string}>
              <X size={24} />
            </button>
            <div style={styles.contentPadding}>
              <div style={styles.headerContainer}>
                {step === 2 && (
                  <button onClick={() => setStep(1)} style={styles.backButton} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = (styles.backButton as CSSProperties).color as string}>
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h2 style={styles.title}>{step === 1 ? 'Reset Your Password' : 'Verify & Create Password'}</h2>
              </div>

              {apiError && <p style={styles.apiGlobalError}><AlertCircle size={14} style={{display: 'inline', marginRight: '0.25rem'}}/>{apiError}</p>}

              {/* Step 1: Request OTP */}
              {step === 1 && (
                <form onSubmit={handleRequestOTP} style={styles.formSpaceY} noValidate>
                  <p style={styles.paragraph}>Enter your email address and we'll send you a verification code to reset your password.</p>
                  <div>
                    <label htmlFor="email-forgot" style={styles.label}>Email Address</label>
                    <div style={styles.inputIconContainer}>
                      <span style={styles.inputIcon}><Mail size={18} /></span>
                      <input id="email-forgot" type="email" value={email} onChange={handleEmailChange} 
                             style={{...styles.inputWithIcon, ...(emailError ? errorInputStyle : {}), ...(emailFocused ? focusedInputStyle : {})}} 
                             placeholder="you@example.com" disabled={isLoading || requestSuccess}
                             onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} />
                    </div>
                    {emailError && <p style={styles.errorMessage}><AlertCircle size={14} style={{ marginRight: '0.25rem' }} />{emailError}</p>}
                  </div>
                  {requestSuccess && (
                    <div style={styles.infoBox}>
                      <Info size={16} style={styles.infoIcon} />
                      <p><span style={{ fontWeight: 500 }}>Verification code sent!</span> Please check your inbox. If you don't receive it, check spam/junk.</p>
                    </div>
                  )}
                  <button type="submit" disabled={isLoading || requestSuccess} style={{...styles.submitButton(requestSuccess), cursor: (isLoading || requestSuccess) ? 'not-allowed' : 'pointer'}}
                          onMouseEnter={(e) => { if (!(isLoading || requestSuccess)) (e.currentTarget.style.backgroundColor = (styles.submitButtonHover(requestSuccess) as CSSProperties).backgroundColor as string) }}
                          onMouseLeave={(e) => { if (!(isLoading || requestSuccess)) (e.currentTarget.style.backgroundColor = (styles.submitButton(requestSuccess) as CSSProperties).backgroundColor as string) }}>
                    {isLoading ? <span style={styles.loadingSpinner}></span> :
                     requestSuccess ? <span style={styles.buttonTextWithIcon}><Check size={18} style={{ marginRight: '0.5rem' }} />Code Sent</span> :
                     (emailError || apiError) ? 'Try Again' : 'Send Verification Code'}
                  </button>
                  <button type="button" onClick={onBackToLogin} style={styles.backToLoginButton} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = (styles.backToLoginButton as CSSProperties).color as string}>
                    Back to Login
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP and Reset Password */}
              {step === 2 && (
                <form onSubmit={handleResetPassword} style={styles.formSpaceYStep2} noValidate>
                  <p style={styles.paragraph}>Enter the code sent to <strong style={{color: 'white'}}>{email}</strong> and create a new password.</p>
                  <div style={styles.infoBox}>
                     <Info size={16} style={styles.infoIcon} />
                     <p><span style={{ fontWeight: 500 }}>Didn't receive code?</span> Check spam/junk or go back to request a new one.</p>
                  </div>
                  <div>
                    <label htmlFor="otp-forgot" style={styles.label}>Verification Code</label>
                    <input id="otp-forgot" type="text" inputMode="numeric" value={otp} onChange={handleOtpChange} 
                           style={{...styles.otpInput, ...(otpError ? errorInputStyle : {}), ...(otpFocused ? focusedInputStyle : {})}} 
                           placeholder="6-digit code" maxLength={6} disabled={isLoading || resetSuccess}
                           onFocus={() => setOtpFocused(true)} onBlur={() => setOtpFocused(false)} />
                    {otpError && <p style={styles.errorMessage}><AlertCircle size={14} style={{ marginRight: '0.25rem' }} />{otpError}</p>}
                  </div>
                  <div>
                    <label htmlFor="newPassword-forgot" style={styles.label}>New Password</label>
                    <div style={styles.inputIconContainer}>
                      <input id="newPassword-forgot" type={showPassword ? "text" : "password"} value={newPassword} onChange={handlePasswordChange} 
                             style={{...baseInputStyle, paddingRight: '2.5rem', ...(passwordError ? errorInputStyle : {}), ...(newPasswordFocused ? focusedInputStyle : {})}} 
                             placeholder="Create a new password" disabled={isLoading || resetSuccess}
                             onFocus={() => setNewPasswordFocused(true)} onBlur={() => setNewPasswordFocused(false)}/>
                      <button type="button" style={styles.eyeButton} onClick={() => setShowPassword(!showPassword)} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = (styles.eyeButton as CSSProperties).color as string}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {showPasswordRequirements && (
                      <div style={styles.requirementsBox}>
                        <p style={styles.requirementsTitle}>Password must contain:</p>
                        <ul style={styles.requirementsList}>
                          {passwordRequirements.map(req => (
                            <li key={req.id} style={styles.requirementItem(req.isMet)}>
                              {req.isMet ? <Check size={12} style={styles.requirementIconMet} /> : <div style={styles.requirementIconNotMet}></div>}
                              {req.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword-forgot" style={styles.label}>Confirm Password</label>
                    <div style={styles.inputIconContainer}>
                      <input id="confirmPassword-forgot" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={handleConfirmPasswordChange} 
                             style={{...baseInputStyle, paddingRight: '2.5rem', ...(passwordError ? errorInputStyle : {}), ...(confirmPasswordFocused ? focusedInputStyle : {})}} 
                             placeholder="Confirm new password" disabled={isLoading || resetSuccess}
                             onFocus={() => setConfirmPasswordFocused(true)} onBlur={() => setConfirmPasswordFocused(false)} />
                      <button type="button" style={styles.eyeButton} onClick={() => setShowConfirmPassword(!showConfirmPassword)} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = (styles.eyeButton as CSSProperties).color as string}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordError && <p style={styles.errorMessage}><AlertCircle size={14} style={{ marginRight: '0.25rem' }} />{passwordError}</p>}
                  </div>
                  <button type="submit" disabled={isLoading || resetSuccess} style={{...styles.submitButton(resetSuccess), cursor: (isLoading || resetSuccess) ? 'not-allowed' : 'pointer'}}
                          onMouseEnter={(e) => { if (!(isLoading || resetSuccess)) (e.currentTarget.style.backgroundColor = (styles.submitButtonHover(resetSuccess) as CSSProperties).backgroundColor as string)}}
                          onMouseLeave={(e) => { if (!(isLoading || resetSuccess)) (e.currentTarget.style.backgroundColor = (styles.submitButton(resetSuccess) as CSSProperties).backgroundColor as string)}}>
                     {isLoading ? <span style={styles.loadingSpinner}></span> :
                      resetSuccess ? <span style={styles.buttonTextWithIcon}><Check size={18} style={{ marginRight: '0.5rem' }}/>Password Reset</span> :
                      'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 