"use client";

import React, { useState, useEffect, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon, LogOut, Edit, Clock, Key, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import {
  logoutUser,
  getCurrentUserProfile,
  updateUserProfile, // Make sure this is exported from your auth utils
  User as AuthUserType, // Assuming User type is exported
} from '@/utils/auth';
import { formatRelativeTime, formatFullDate } from '@/utils/formatTime';
import ChangePasswordModal from '@/components/ChangePasswordModal'; // Using path alias
import DeleteAccountConfirmationModal from '@/components/DeleteAccountConfirmationModal'; // Import delete confirmation modal

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string; // Passed to identify the user for actions
}

// Re-define UserProfile or import if it's a shared type distinct from AuthUserType
interface UserProfile extends AuthUserType {}

const baseInputStyle: CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
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

export default function AccountModal({ isOpen, onClose, userEmail }: AccountModalProps) {
  const [currentUsername, setCurrentUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // State for delete confirmation modal

  useEffect(() => {
    const loadUserData = async () => {
      if (isOpen && userEmail) {
        setIsLoadingProfile(true);
        setUsernameError('');
        setUsernameSuccess('');
        setIsEditingUsername(false);
        try {
          const result = await getCurrentUserProfile(); // This uses cookie, ensure email matches
          if (result.success && result.user) {
            const user = result.user as UserProfile;
            setCurrentUsername(user.username || '');
            setNewUsername(user.username || '');
            setCreatedAt(user.createdAt || null);
          } else {
            setUsernameError(result.message || 'Failed to load user data.');
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
          setUsernameError('Failed to load user data. Please try again.');
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };
    loadUserData();
  }, [isOpen, userEmail]);

  const handleLogout = async () => {
    await logoutUser();
    onClose(); // Close modal after logout actions in logoutUser (e.g. reload)
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }
    if (newUsername.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    if (newUsername.trim().length > 16) {
      setUsernameError('Username cannot exceed 16 characters');
      return;
    }

    setUsernameError('');
    setUsernameSuccess('');
    setIsLoadingUpdate(true);

    try {
      // Ensure your updateUserProfile function exists and is correctly imported
      const result = await updateUserProfile(userEmail, newUsername.trim());
      if (result.success) {
        setCurrentUsername(newUsername.trim());
        setIsEditingUsername(false);
        setUsernameSuccess('Username updated successfully!');
        setTimeout(() => setUsernameSuccess(''), 3000);
      } else {
        setUsernameError(result.message || 'Failed to update username');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setUsernameError('Failed to update username. Please try again.');
    } finally {
      setIsLoadingUpdate(false);
    }
  };
  
  const [usernameFocused, setUsernameFocused] = useState(false);

  const styles = {
    modalOverlay: { position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' } as CSSProperties,
    backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' } as CSSProperties,
    modalContent: { position: 'relative', backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.75rem', width: 'auto', maxWidth: '28rem', margin: '1rem', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'} as CSSProperties,
    closeButton: { position: 'absolute', top: '1rem', right: '1rem', color: '#9ca3af', cursor: 'pointer' } as CSSProperties,
    contentPadding: { padding: '1.5rem' } as CSSProperties,
    headerSection: { marginBottom: '2rem', textAlign: 'center' } as CSSProperties,
    avatarContainer: { width: '5rem', height: '5rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto'} as CSSProperties,
    title: { fontSize: '1.5rem', fontWeight: 'bold', color: 'white', fontFamily: 'sans-serif', marginBottom: '0.5rem' } as CSSProperties,
    emailText: { color: '#9ca3af', fontSize: '0.875rem' } as CSSProperties,
    createdAtContainer: { marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.875rem' } as CSSProperties,
    loadingContainer: { display: 'flex', justifyContent: 'center', padding: '2rem 0'} as CSSProperties,
    loadingText: { fontFamily: 'sans-serif', color: '#9ca3af', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' } as CSSProperties,
    contentBodySpaceY: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as CSSProperties,
    usernameSection: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '1rem' } as CSSProperties,
    usernameHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' } as CSSProperties,
    sectionTitle: { color: '#d1d5db', fontWeight: 500, fontFamily: 'sans-serif' } as CSSProperties,
    editButton: { color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' } as CSSProperties,
    usernameEditContainerSpaceY: { display: 'flex', flexDirection: 'column', gap: '0.75rem' } as CSSProperties,
    inputField: (isError: boolean, isFocused: boolean) => ({ ...baseInputStyle, ...(isError ? errorInputStyle : {}), ...(isFocused ? focusedInputStyle : {}) }),
    errorText: { color: '#ef4444', fontSize: '0.875rem' } as CSSProperties,
    successText: { color: '#22c55e', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center' } as CSSProperties,
    buttonGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' } as CSSProperties,
    actionButton: (isPrimary: boolean = true) => ({
      flex: 'none',
      padding: '0.5rem 1rem',
      backgroundColor: isPrimary ? 'rgba(255,255,255,0.1)' : 'black',
      color: 'white', fontFamily: 'sans-serif', fontWeight: 500, borderRadius: '0.5rem',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'all 0.3s', cursor: 'pointer', outline: 'none',
      opacity: isLoadingUpdate ? 0.7 : 1,
    } as CSSProperties),
    actionButtonHover: (isPrimary: boolean = true) => ({ backgroundColor: isPrimary ? 'rgba(255,255,255,0.2)' : '#1f2937' }), // gray-900 for secondary
    currentUsernameText: { color: 'white', fontSize: '1.125rem' } as CSSProperties,
    menuButtonBase: {
      width: '100%', padding: '0.75rem 1rem',
      backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontFamily: 'sans-serif',
      fontWeight: 500, borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)',
      transition: 'all 0.3s', cursor: 'pointer', outline: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
    } as CSSProperties,
    menuButtonHover: { backgroundColor: 'rgba(255,255,255,0.2)' } as CSSProperties,
    logoutButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' } as CSSProperties,
    logoutButtonHover: { backgroundColor: 'rgba(239, 68, 68, 0.2)' } as CSSProperties,
    deleteButton: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', marginTop: '0.75rem' } as CSSProperties, // Added style for delete button
    deleteButtonHover: { backgroundColor: 'rgba(239, 68, 68, 0.2)' } as CSSProperties,
  };

  const handleActionButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, isPrimary: boolean = true) => {
    if (!isLoadingUpdate) e.currentTarget.style.backgroundColor = styles.actionButtonHover(isPrimary).backgroundColor as string;
  };
  const handleActionButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, isPrimary: boolean = true) => {
    if (!isLoadingUpdate) e.currentTarget.style.backgroundColor = (styles.actionButton(isPrimary) as CSSProperties).backgroundColor as string;
  };
  const handleMenuButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, isLogout: boolean = false) => {
    e.currentTarget.style.backgroundColor = isLogout ? styles.logoutButtonHover.backgroundColor as string : styles.menuButtonHover.backgroundColor as string;
  };
  const handleMenuButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, isLogout: boolean = false) => {
    e.currentTarget.style.backgroundColor = isLogout ? (styles.logoutButton as CSSProperties).backgroundColor as string : (styles.menuButtonBase as CSSProperties).backgroundColor as string;
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !isChangePasswordOpen && (
          <div style={styles.modalOverlay}>
            <motion.div style={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
            <motion.div style={styles.modalContent} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", duration: 0.5 }}>
              <button onClick={onClose} style={styles.closeButton} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = (styles.closeButton as CSSProperties).color as string}>
                <X size={24} />
              </button>
              <div style={styles.contentPadding}>
                <div style={styles.headerSection}>
                  <div style={styles.avatarContainer}><UserIcon size={40} style={{ color: 'rgba(255,255,255,0.7)' }} /></div>
                  <h2 style={styles.title}>Account</h2>
                  <p style={styles.emailText}>{userEmail}</p>
                  {createdAt && (
                    <div style={styles.createdAtContainer}>
                      <Clock size={14} style={{ marginRight: '0.25rem' }} />
                      <span title={formatFullDate(createdAt)}>Account created {formatRelativeTime(createdAt)}</span>
                    </div>
                  )}
                </div>

                {isLoadingProfile ? (
                  <div style={styles.loadingContainer}><div style={styles.loadingText}>Loading account data...</div></div>
                ) : (
                  <div style={styles.contentBodySpaceY}>
                    <div style={styles.usernameSection}>
                      <div style={styles.usernameHeader}>
                        <h3 style={styles.sectionTitle}>Username</h3>
                        {!isEditingUsername && (
                          <button onClick={() => setIsEditingUsername(true)} style={styles.editButton} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = (styles.editButton as CSSProperties).color as string}>
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                      {isEditingUsername ? (
                        <div style={styles.usernameEditContainerSpaceY}>
                          <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                                 style={styles.inputField(!!usernameError, usernameFocused)}
                                 placeholder="Enter new username" maxLength={16}
                                 onFocus={() => setUsernameFocused(true)} onBlur={() => setUsernameFocused(false)} />
                          {usernameError && <p style={styles.errorText}><AlertCircle size={14} style={{ marginRight: '0.25rem'}} />{usernameError}</p>}
                          <div style={styles.buttonGroup}>
                            <button onClick={handleUpdateUsername} disabled={isLoadingUpdate} style={styles.actionButton(true)}
                                    onMouseEnter={(e) => handleActionButtonMouseEnter(e, true)}
                                    onMouseLeave={(e) => handleActionButtonMouseLeave(e, true)}>
                              {isLoadingUpdate ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => { setIsEditingUsername(false); setNewUsername(currentUsername); setUsernameError(''); }} style={styles.actionButton(false)}
                                    onMouseEnter={(e) => handleActionButtonMouseEnter(e, false)}
                                    onMouseLeave={(e) => handleActionButtonMouseLeave(e, false)} disabled={isLoadingUpdate}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={styles.currentUsernameText}>{currentUsername || 'No username set'}</p>
                          {usernameSuccess && <p style={styles.successText}><CheckCircle size={14} style={{ marginRight: '0.25rem'}}/>{usernameSuccess}</p>}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ paddingTop: '0.5rem' }}>
                      <button onClick={() => setIsChangePasswordOpen(true)} style={styles.menuButtonBase} 
                              onMouseEnter={(e) => handleMenuButtonMouseEnter(e)} 
                              onMouseLeave={(e) => handleMenuButtonMouseLeave(e)}>
                        <Key size={18} /><span>Change Password</span>
                      </button>
                    </div>
                    {/* Delete Account Button - Added before Log Out */}
                    <div>
                      <button onClick={() => setIsDeleteConfirmOpen(true)} style={{...styles.menuButtonBase, ...styles.deleteButton}}
                              onMouseEnter={(e) => handleMenuButtonMouseEnter(e, true)} // Reuse logout hover for now, can be customized
                              onMouseLeave={(e) => handleMenuButtonMouseLeave(e, true)}>
                        <ShieldAlert size={18} /><span>Delete Account</span>
                      </button>
                    </div>
                    <div> {/* Removed pt-2 from original, gap is handled by contentBodySpaceY */}
                      <button onClick={handleLogout} style={{...styles.menuButtonBase, ...styles.logoutButton}}
                              onMouseEnter={(e) => handleMenuButtonMouseEnter(e, true)}
                              onMouseLeave={(e) => handleMenuButtonMouseLeave(e, true)}>
                        <LogOut size={18} /><span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ChangePasswordModal
        isOpen={isOpen && isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userEmail={userEmail} 
        onSuccess={() => {
          setIsChangePasswordOpen(false);
        }}
      />

      <DeleteAccountConfirmationModal
        isOpen={isOpen && isDeleteConfirmOpen}
        onClose={() => {
            setIsDeleteConfirmOpen(false);
            // If account was deleted, logoutUser would have been called, 
            // which might reload or redirect. If not, ensure AccountModal also closes.
            // onClose(); // This might be needed if logoutUser doesn't force a full UI update that closes AccountModal
        }}
        userEmail={userEmail}
      />
    </>
  );
}

// Keyframes for pulse animation if not using Tailwind/CSS file
const keyframesStyle = `
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
`;
// You might need to inject this into the document head or a style tag if not using CSS-in-JS that handles keyframes
if (typeof window !== 'undefined' && !document.getElementById('pulse-keyframes')) {
  const styleSheet = document.createElement("style")
  styleSheet.id = "pulse-keyframes"
  styleSheet.type = "text/css"
  styleSheet.innerText = keyframesStyle
  document.head.appendChild(styleSheet)
} 