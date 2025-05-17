'use client';

import React, { useState, CSSProperties, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { deleteAccount, logoutUser } from '@/utils/auth';

interface DeleteAccountConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
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

export default function DeleteAccountConfirmationModal({
  isOpen,
  onClose,
  userEmail,
}: DeleteAccountConfirmationModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleDelete = async () => {
    if (!password) {
      setError('Password is required to confirm deletion.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await deleteAccount(userEmail, password);
      if (result.success) {
        await logoutUser(); // Logout user after successful deletion
        onClose(); // Close this modal
        // Parent modal (AccountModal) should also close or redirect. The logoutUser might handle redirection.
      } else {
        setError(result.message || 'Failed to delete account. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError('');
      setIsLoading(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  const styles = {
    modalOverlay: { position: 'fixed', inset: 0, zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center' } as CSSProperties,
    backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)' } as CSSProperties,
    modalContent: { position: 'relative', backgroundColor: 'var(--card-background)', border: '1px solid var(--destructive)', borderRadius: '0.75rem', width: 'auto', maxWidth: '28rem', margin: '1rem', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.1)' } as CSSProperties,
    closeButton: { position: 'absolute', top: '1rem', right: '1rem', color: 'var(--foreground-secondary)', cursor: 'pointer' } as CSSProperties,
    titleContainer: { display: 'flex', alignItems: 'center', color: 'var(--destructive)', marginBottom: '1rem' } as CSSProperties,
    titleIcon: { marginRight: '0.75rem' } as CSSProperties,
    title: { fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'sans-serif', color: 'var(--destructive)' } as CSSProperties,
    warningText: { color: 'var(--foreground-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: 1.6 } as CSSProperties,
    label: { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '0.25rem' } as CSSProperties,
    inputContainer: { position: 'relative', marginBottom: '1.5rem' } as CSSProperties,
    inputField: { ...baseInputStyle, paddingRight: '2.5rem', borderColor: error ? 'var(--destructive)' : 'var(--input-border)' } as CSSProperties,
    eyeButton: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '0.75rem', display: 'flex', alignItems: 'center', color: 'var(--foreground-secondary)', background: 'none', border: 'none', cursor: 'pointer' } as CSSProperties,
    errorMessage: { color: 'var(--destructive)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' } as CSSProperties,
    buttonGroup: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' } as CSSProperties,
    confirmButton: { flex: 'none', padding: '0.75rem 1rem', backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)', fontFamily: 'sans-serif', fontWeight: 500, borderRadius: '0.5rem', border: '1px solid transparent', transition: 'all 0.3s', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 } as CSSProperties,
    cancelButton: { flex: 'none', padding: '0.75rem 1rem', backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', fontFamily: 'sans-serif', fontWeight: 500, borderRadius: '0.5rem', border: '1px solid var(--border)', transition: 'all 0.3s', cursor: 'pointer' } as CSSProperties,
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={styles.modalOverlay}>
          <motion.div style={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={isLoading ? undefined : onClose} />
          <motion.div style={styles.modalContent} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', duration: 0.5 }}>
            {!isLoading && (
                <button onClick={onClose} style={styles.closeButton} onMouseEnter={(e) => e.currentTarget.style.color = '#111827'} onMouseLeave={(e) => e.currentTarget.style.color = (styles.closeButton as CSSProperties).color as string}>
                    <X size={24} />
                </button>
            )}
            <div style={styles.titleContainer}>
              <AlertTriangle size={32} style={styles.titleIcon} />
              <h2 style={styles.title}>Delete Account</h2>
            </div>
            <p style={styles.warningText}>
              This action is irreversible. All your data associated with this account will be permanently deleted. 
              Please enter your password to confirm.
            </p>
            
            {error && <p style={styles.errorMessage}>{error}</p>}

            <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }}>
              <div>
                <label htmlFor="confirm-password-delete" style={styles.label}>Password</label>
                <div style={styles.inputContainer}>
                  <input 
                    id="confirm-password-delete" 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{...styles.inputField, ...(passwordFocused ? focusedInputStyle : {})}} 
                    placeholder="Enter your password"
                    disabled={isLoading}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <button 
                    type="button" 
                    style={styles.eyeButton} 
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                    onMouseLeave={(e) => e.currentTarget.style.color = (styles.eyeButton as CSSProperties).color as string}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={styles.buttonGroup}>
                <button type="button" onClick={onClose} style={styles.cancelButton} disabled={isLoading}
                        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#e5e7eb'}}
                        onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = (styles.cancelButton as CSSProperties).backgroundColor as string}}>
                  Cancel
                </button>
                <button type="submit" style={styles.confirmButton} disabled={isLoading || !password}
                        onMouseEnter={(e) => { if (!isLoading && password) e.currentTarget.style.backgroundColor = '#dc2626' /* red-600 */ }}
                        onMouseLeave={(e) => { if (!isLoading && password) e.currentTarget.style.backgroundColor = (styles.confirmButton as CSSProperties).backgroundColor as string}}>
                  {isLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 