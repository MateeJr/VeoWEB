"use client";

import React, { useState, useEffect, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import { changePassword as changePasswordApi } from '@/utils/auth'; // Renamed to avoid conflict

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onSuccess: () => void; // Callback for successful password change
}

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  isMet: boolean;
}

const baseInputStyle: CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '0.5rem',
  padding: '0.5rem 2.5rem 0.5rem 2.5rem', // Space for icons on both sides potentially
  color: 'white',
  fontFamily: 'sans-serif',
  outline: 'none',
};

const focusedInputStyle: CSSProperties = {
  boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3)',
};

const errorInputStyle: CSSProperties = {
  borderColor: 'rgb(239 68 68 / 1)',
};

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userEmail,
  onSuccess,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  
  const [changeSuccess, setChangeSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', label: 'Minimum 8 characters', validator: (p) => p.length >= 8, isMet: false },
    { id: 'uppercase', label: 'Minimum 1 uppercase', validator: (p) => /[A-Z]/.test(p), isMet: false },
    { id: 'lowercase', label: 'Minimum 1 lowercase', validator: (p) => /[a-z]/.test(p), isMet: false },
    { id: 'numberSymbol', label: 'Minimum 1 number or symbol', validator: (p) => /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p), isMet: false },
  ]);

  useEffect(() => {
    if (isOpen) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setCurrentPasswordError('');
        setNewPasswordError('');
        setApiError('');
        setChangeSuccess(false);
        setIsLoading(false);
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmNewPassword(false);
        setShowPasswordRequirements(false);
        setPasswordRequirements(prev => prev.map(req => ({ ...req, isMet: false })));
    }
  }, [isOpen]);

  const validatePasswordFn = (password: string) => {
    const updated = passwordRequirements.map(req => ({ ...req, isMet: req.validator(password) }));
    setPasswordRequirements(updated);
    return updated.every(req => req.isMet);
  };

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
    setCurrentPasswordError(''); setApiError('');
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
    setNewPasswordError(''); setApiError('');
    if (val && val.length > 16) {
        setNewPasswordError('Password cannot exceed 16 characters');
        setShowPasswordRequirements(false);
        return;
    }
    const met = validatePasswordFn(val);
    setShowPasswordRequirements(!met);
    if (confirmNewPassword && val !== confirmNewPassword) setNewPasswordError('Passwords do not match');
    else if (newPasswordError === 'Passwords do not match') setNewPasswordError('');
  };

  const handleConfirmNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmNewPassword(val);
    setNewPasswordError(''); setApiError('');
    if (val !== newPassword) setNewPasswordError('Passwords do not match');
    else setNewPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPasswordError(''); setNewPasswordError(''); setApiError('');
    let hasError = false;

    if (!currentPassword) { setCurrentPasswordError('Current password is required'); hasError = true; }
    if (!newPassword) { setNewPasswordError('New password is required'); hasError = true; }
    else if (newPassword.length > 16) { setNewPasswordError('Password cannot exceed 16 characters'); hasError = true; }
    else if (!validatePasswordFn(newPassword)) {
      setNewPasswordError('New password does not meet all requirements');
      setShowPasswordRequirements(true);
      hasError = true;
    }
    if (newPassword !== confirmNewPassword) { setNewPasswordError('Passwords do not match'); hasError = true; }

    if (hasError) return;

    setIsLoading(true);
    try {
      const result = await changePasswordApi(userEmail, currentPassword, newPassword);
      if (result.success) {
        setChangeSuccess(true);
        setTimeout(() => {
          onSuccess(); // Call parent onSuccess
          onClose();   // Then close this modal
        }, 2000);
      } else {
        setApiError(result.message || 'Failed to change password.');
        if (result.message?.toLowerCase().includes('current')) {
            setCurrentPasswordError(result.message);
        }
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const [currentPassFocused, setCurrentPassFocused] = useState(false);
  const [newPassFocused, setNewPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);

  const styles = {
    modalOverlay: { position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' } as CSSProperties, // Updated zIndex
    backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' } as CSSProperties,
    modalContent: { position: 'relative', backgroundColor: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.75rem', width: 'auto', maxWidth: '28rem', margin: '1rem', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' } as CSSProperties,
    closeButton: { position: 'absolute', top: '1rem', right: '1rem', color: '#9ca3af', cursor: 'pointer' } as CSSProperties,
    contentPadding: { padding: '1.5rem' } as CSSProperties,
    headerContainer: { marginBottom: '1.5rem' } as CSSProperties,
    title: { fontSize: '1.5rem', fontWeight: 'bold', color: 'white', fontFamily: 'sans-serif' } as CSSProperties,
    paragraph: { color: '#d1d5db', marginBottom: '1.5rem', fontSize: '0.875rem' } as CSSProperties,
    formSpaceY: { display: 'flex', flexDirection: 'column', gap: '1.25rem' } as CSSProperties,
    label: { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '0.25rem' } as CSSProperties,
    inputContainer: { position: 'relative' } as CSSProperties,
    inputIcon: { position: 'absolute', insetY: 0, left: 0, display: 'flex', alignItems: 'center', paddingLeft: '0.75rem', color: '#9ca3af' } as CSSProperties,
    inputField: (isError: boolean, isFocused: boolean) => ({ ...baseInputStyle, paddingLeft: '2.5rem', paddingRight: '2.5rem', ...(isError ? errorInputStyle : {}), ...(isFocused ? focusedInputStyle : {}) }),
    eyeButton: { position: 'absolute', insetY: 0, right: 0, paddingRight: '0.75rem', display: 'flex', alignItems: 'center', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' } as CSSProperties,
    errorMessage: { marginTop: '0.25rem', color: '#ef4444', fontSize: '0.875rem', display: 'flex', alignItems: 'center' } as CSSProperties,
    apiGlobalError: { marginTop: '0.5rem', color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' } as CSSProperties,
    requirementsBox: { marginTop: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.5rem' } as CSSProperties,
    requirementsTitle: { fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.5rem' } as CSSProperties,
    requirementsList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' } as CSSProperties,
    requirementItem: (isMet: boolean) => ({ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: isMet ? '#22c55e' : '#9ca3af' } as CSSProperties),
    requirementIconMet: { marginRight: '0.25rem' } as CSSProperties,
    requirementIconNotMet: { width: '0.75rem', height: '0.75rem', border: '1px solid #9ca3af', borderRadius: '9999px', marginRight: '0.25rem' } as CSSProperties,
    submitButton: (isSuccess: boolean) => ({
      width: '100%', padding: '0.75rem 1rem',
      backgroundColor: isSuccess ? '#16a34a' : 'rgba(255,255,255,0.1)',
      color: 'white', fontFamily: 'sans-serif', fontWeight: 500, borderRadius: '0.5rem',
      border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s',
      cursor: (isLoading || isSuccess) ? 'not-allowed' : 'pointer',
      outline: 'none', position: 'relative', overflow: 'hidden',
      opacity: isLoading ? 0.7 : 1,
    } as CSSProperties),
    submitButtonHover: (isSuccess: boolean) => ({ backgroundColor: isSuccess ? '#16a34a' : 'rgba(255,255,255,0.2)' }),
    loadingSpinner: { display: 'inline-block', height: '1.25rem', width: '1.25rem', animation: 'spin 1s linear infinite', borderRadius: '9999px', border: '2px solid white', borderTopColor: 'transparent' } as CSSProperties,
    buttonTextWithIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as CSSProperties,
  };
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={styles.modalOverlay}>
          <motion.div style={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div style={styles.modalContent} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", duration: 0.5 }}>
            <button onClick={onClose} style={styles.closeButton} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = (styles.closeButton as CSSProperties).color as string}>
              <X size={24} />
            </button>
            <div style={styles.contentPadding}>
              <div style={styles.headerContainer}>
                <h2 style={styles.title}>Change Your Password</h2>
              </div>
              <form onSubmit={handleSubmit} style={styles.formSpaceY} noValidate>
                <p style={styles.paragraph}>Enter your current password and create a new one.</p>
                {apiError && <p style={styles.apiGlobalError}><AlertCircle size={14} style={{display: 'inline', marginRight: '0.25rem'}}/>{apiError}</p>}
                <div>
                  <label htmlFor="currentPassword-change" style={styles.label}>Current Password</label>
                  <div style={styles.inputContainer}>
                    <span style={styles.inputIcon}><Lock size={18} /></span>
                    <input id="currentPassword-change" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={handleCurrentPasswordChange}
                           style={styles.inputField(!!currentPasswordError, currentPassFocused)}
                           placeholder="Enter current password" disabled={isLoading || changeSuccess} maxLength={16}
                           onFocus={() => setCurrentPassFocused(true)} onBlur={() => setCurrentPassFocused(false)} />
                    <button type="button" style={styles.eyeButton} onClick={() => setShowCurrentPassword(!showCurrentPassword)} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = (styles.eyeButton as CSSProperties).color as string}>
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {currentPasswordError && <p style={styles.errorMessage}><AlertCircle size={14} style={{ marginRight: '0.25rem' }} />{currentPasswordError}</p>}
                </div>
                <div>
                  <label htmlFor="newPassword-change" style={styles.label}>New Password</label>
                  <div style={styles.inputContainer}>
                    <span style={styles.inputIcon}><Lock size={18} /></span>
                    <input id="newPassword-change" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={handleNewPasswordChange}
                           style={styles.inputField(!!newPasswordError, newPassFocused)}
                           placeholder="Create new password" disabled={isLoading || changeSuccess} maxLength={16}
                           onFocus={() => setNewPassFocused(true)} onBlur={() => setNewPassFocused(false)} />
                    <button type="button" style={styles.eyeButton} onClick={() => setShowNewPassword(!showNewPassword)} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = (styles.eyeButton as CSSProperties).color as string}>
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  <label htmlFor="confirmNewPassword-change" style={styles.label}>Confirm New Password</label>
                  <div style={styles.inputContainer}>
                    <span style={styles.inputIcon}><Lock size={18} /></span>
                    <input id="confirmNewPassword-change" type={showConfirmNewPassword ? "text" : "password"} value={confirmNewPassword} onChange={handleConfirmNewPasswordChange}
                           style={styles.inputField(!!newPasswordError && newPasswordError.includes("match"), confirmPassFocused)}
                           placeholder="Confirm new password" disabled={isLoading || changeSuccess} maxLength={16}
                           onFocus={() => setConfirmPassFocused(true)} onBlur={() => setConfirmPassFocused(false)} />
                    <button type="button" style={styles.eyeButton} onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = (styles.eyeButton as CSSProperties).color as string}>
                      {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {newPasswordError && <p style={styles.errorMessage}><AlertCircle size={14} style={{ marginRight: '0.25rem' }} />{newPasswordError}</p>}
                </div>
                <button type="submit" disabled={isLoading || changeSuccess} 
                        style={{...styles.submitButton(changeSuccess), cursor: (isLoading || changeSuccess) ? 'not-allowed' : 'pointer'}}
                        onMouseEnter={(e) => { if (!(isLoading || changeSuccess)) (e.currentTarget.style.backgroundColor = (styles.submitButtonHover(changeSuccess) as CSSProperties).backgroundColor as string)}}
                        onMouseLeave={(e) => { if (!(isLoading || changeSuccess)) (e.currentTarget.style.backgroundColor = (styles.submitButton(changeSuccess) as CSSProperties).backgroundColor as string)}}>
                  {isLoading ? <span style={styles.loadingSpinner}></span> :
                   changeSuccess ? <span style={styles.buttonTextWithIcon}><Check size={18} style={{ marginRight: '0.5rem' }} />Password Changed</span> :
                   'Change Password'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 