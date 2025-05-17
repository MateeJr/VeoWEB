'use client';

import React, { useState, useEffect, CSSProperties } from 'react';
import { LuX, LuUser, LuPalette, LuDatabase, LuWand, LuInfo, LuArrowLeft, LuChevronRight, LuClock, LuKey, LuShieldAlert, LuLogOut, LuPencil, LuCheck, LuTriangle, LuSun, LuMoon, LuMonitor, LuClipboard, LuActivity } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import {
  logoutUser,
  getCurrentUserProfile,
  updateUserProfile,
  User as AuthUserType,
  updateUserSettings,
} from '@/utils/auth';
import { formatRelativeTime, formatFullDate } from '@/utils/formatTime';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import DeleteAccountConfirmationModal from '@/components/DeleteAccountConfirmationModal';
import { useAuth } from '@/utils/auth'; // Added for user email
import { useTheme, ThemeMode } from '@/contexts/ThemeContext'; // Fix the import path

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  isSmallScreen: boolean;
  initialTab?: string; // Add optional prop to specify which tab to open initially
}

// Define UserProfile or import if it's a shared type distinct from AuthUserType
interface UserProfile extends AuthUserType {
  allowLogging?: boolean;
  allowTelemetry?: boolean;
}

// Define menu items
const menuItems = [
  { id: 'account', name: 'Account', icon: LuUser },
  { id: 'appearance', name: 'Appearance', icon: LuPalette },
  { id: 'dataControls', name: 'Data Controls', icon: LuDatabase },
  { id: 'customization', name: 'Customization', icon: LuWand },
  { id: 'about', name: 'About', icon: LuInfo },
];

// Styles from AccountModal (can be refactored or kept separate)
const baseInputStyle: CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--input-background)',
  border: '1px solid var(--input-border)',
  borderRadius: '0.375rem',
  padding: '0.5rem 0.75rem', // Adjusted padding (8px, 12px)
  color: 'var(--input-foreground)', // Use theme variable for text color
  fontFamily: 'sans-serif',
  fontSize: '0.875rem', // 14px
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const focusedInputStyle: CSSProperties = {
  borderColor: 'var(--primary)', // Use theme variable
  boxShadow: 'var(--ring)', // Use theme variable for focus ring
};

const errorInputStyle: CSSProperties = {
  borderColor: 'var(--destructive)', // Use theme variable for error
  boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.15)',
};

const accountModalStyles = {
  // Overall container for account content within the menu panel
  accountPageContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    height: '100%', // Occupy full height of content area
    padding: '1.25rem' // 20px padding overall for the page
  } as CSSProperties,
  headerSection: { 
    marginBottom: '1.5rem', // 24px, reduced from 2rem
    textAlign: 'center', 
    paddingBottom: '1.5rem', // Add padding below for separation if using a border
    borderBottom: '1px solid var(--border)', // Separator line for desktop
  } as CSSProperties,
  avatarContainer: { 
    width: '4rem', // 64px
    height: '4rem', 
    backgroundColor: 'var(--background-secondary)', // Use theme variable
    borderRadius: '9999px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: '0 auto 0.75rem auto', // 12px bottom margin
    color: 'var(--foreground-secondary)'
  } as CSSProperties,
  title: { fontSize: '1.25rem', fontWeight: '600', color: 'var(--foreground)', fontFamily: 'sans-serif', marginBottom: '0.25rem' } as CSSProperties, // 20px
  emailText: { color: 'var(--foreground-secondary)', fontSize: '0.875rem', marginBottom: '0.125rem' /* Reduced margin */ } as CSSProperties, 
  accountIdText: { 
    color: 'var(--foreground-secondary)', 
    fontSize: '0.8125rem', // 13px, slightly smaller
    fontFamily: 'sans-serif', 
    marginBottom: '0.375rem' // 6px margin before created At
  } as CSSProperties,
  accountIdLabel: {
    fontWeight: '500',
    color: 'var(--foreground-secondary)' // Slightly darker for the label
  } as CSSProperties,
  createdAtContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground-secondary)', fontSize: '0.8125rem' } as CSSProperties, // 13px
  
  // Main content layout (becomes flex row on desktop)
  mainContentLayout: (isSmall: boolean): CSSProperties => ({
    display: 'flex',
    flexDirection: isSmall ? 'column' : 'row',
    gap: isSmall ? '1.25rem' : '1.75rem', // 20px for small, 28px for desktop gap
    flex: 1, // Allow this area to grow and fill space
    overflowY: 'auto', // Allow scrolling within this area if content overflows
    paddingTop: isSmall ? 0 : '1.25rem', // Add some top padding for desktop columns
  }),
  leftColumn: {
    flex: '2', // Takes more space, e.g., 60-66%
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem', // 20px gap between items in left column
  } as CSSProperties,
  rightColumn: {
    flex: '1', // Takes less space, e.g., 33-40%
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem', // 12px gap between buttons in right column
    // borderLeft: '1px solid var(--border)', // Optional separator for desktop
    // paddingLeft: '1.75rem', // Optional padding if border is used
  } as CSSProperties,

  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems:'center', padding: '2rem 0', flex:1 } as CSSProperties,
  loadingText: { fontFamily: 'sans-serif', color: 'var(--foreground-secondary)', fontSize: '0.9375rem' } as CSSProperties, // 15px
  
  usernameSection: { 
    backgroundColor: 'var(--card-background)', 
    borderRadius: '0.5rem', // 8px
    padding: '1rem', // 16px padding
    border: '1px solid var(--card-border)', 
    boxShadow: 'var(--shadow-sm)', 
  } as CSSProperties,
  usernameDisplayContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as CSSProperties,
  usernameLabelAndValue: {
    display: 'flex',
    flexDirection: 'column',
  } as CSSProperties,
  usernameLabel: { 
    color: 'var(--foreground-secondary)', 
    fontSize: '0.8125rem', // 13px
    fontWeight: '500', 
    fontFamily: 'sans-serif', 
    marginBottom: '0.125rem' // 2px space below label
  } as CSSProperties, 
  currentUsernameText: { 
    color: 'var(--foreground)', 
    fontSize: '0.9375rem', // 15px
    fontWeight: '500'
  } as CSSProperties,
  editButton: { 
    color: 'var(--foreground-secondary)', // Lighter initial color for edit icon
    background: 'transparent', 
    border: 'none', 
    cursor: 'pointer', 
    padding: '0.25rem', // 4px
    borderRadius: '0.25rem',
  } as CSSProperties,
  editButtonHover: {
    color: 'var(--primary)', 
    backgroundColor: 'var(--accent)', // Light blue background on hover
  } as CSSProperties,
  usernameEditContainerSpaceY: { display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.75rem' } as CSSProperties, // 10px gap, 12px margin top
  inputField: (isError: boolean, isFocused: boolean) => ({ 
    ...baseInputStyle, 
    ...(isError ? errorInputStyle : {}), 
    ...(isFocused ? focusedInputStyle : {}) 
  }),
  errorText: { color: 'var(--destructive)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', marginTop: '0.125rem' } as CSSProperties,
  successText: { color: 'var(--success)', fontSize: '0.8125rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center' } as CSSProperties, // Darker green
  
  // Edit Username Save/Cancel buttons
  editActionsGroup: { display: 'flex', flexDirection: 'row', gap: '0.625rem', marginTop: '0.5rem' } as CSSProperties, 
  smallActionButton: (isPrimary: boolean = true, isLoading?: boolean): CSSProperties => ({
    flex: 'none', // Don't grow, fit content
    padding: '0.375rem 0.75rem', // 6px 12px padding (smaller)
    backgroundColor: isPrimary ? 'var(--primary)' : 'var(--secondary)',
    color: isPrimary ? 'var(--primary-foreground)' : 'var(--secondary-foreground)',
    fontFamily: 'sans-serif', fontWeight: '500', borderRadius: '0.25rem', // 4px radius
    fontSize: '0.8125rem', // 13px
    border: '1px solid transparent',
    transition: 'background-color 0.2s ease, opacity 0.2s ease',
    cursor: 'pointer', outline: 'none',
    opacity: isLoading ? 0.7 : 1,
  }),
  smallActionButtonHover: (isPrimary: boolean = true) => ({
     backgroundColor: isPrimary ? 'var(--primary-hover)' : 'var(--secondary-hover)' // Darker shades for hover
  }),
  
  // Styles for main action buttons (Change Pwd, Delete, Logout) in the right column or stacked on mobile
  mainActionButton: (variant: 'default' | 'danger' = 'default'): CSSProperties => ({
    width: '100%', padding: '0.625rem 1rem',
    backgroundColor: variant === 'danger' ? 'var(--destructive)' : 'var(--secondary)',
    color: variant === 'danger' ? 'var(--destructive-foreground)' : 'var(--secondary-foreground)',
    fontFamily: 'sans-serif',
    fontWeight: '500', 
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: variant === 'danger' ? 'var(--destructive)' : 'var(--border)',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease', 
    cursor: 'pointer', 
    outline: 'none',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    gap: '0.625rem'
  }),
  mainActionButtonHover: (variant: 'default' | 'danger' = 'default'): CSSProperties => ({
    // Re-apply all base properties from mainActionButton that should persist
    width: '100%', 
    padding: '0.625rem 1rem',
    fontFamily: 'sans-serif',
    fontWeight: '500', 
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    cursor: 'pointer', 
    outline: 'none',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    gap: '0.625rem',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',

    // Overrides for hover state
    backgroundColor: variant === 'danger' ? 'var(--destructive-hover)' : 'var(--secondary-hover)', // Darker red / lighter grey for bg
    borderColor: variant === 'danger' ? 'var(--destructive-hover)' : 'var(--border)',   // Darker red border / lighter grey border
    color: variant === 'danger' ? 'var(--destructive-foreground)' : 'var(--secondary-foreground)',       // Darker red text / darker grey text
  }),
};

// Add this interface for the theme option component
interface ThemeOptionProps {
  mode: ThemeMode;
  currentTheme: ThemeMode;
  onClick: (mode: ThemeMode) => void;
  icon: React.ReactNode;
  label: string;
  description: string;
  isSmallScreen: boolean;
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, isSmallScreen, initialTab }) => {
  // Use initialTab prop if provided, otherwise default to first menu item
  const [activeMenuItem, setActiveMenuItem] = useState<string>(initialTab || menuItems[0].id);
  const [currentView, setCurrentView] = useState<'main' | 'subpage'>(initialTab ? 'subpage' : 'main');
  const { user } = useAuth();
  const { theme, setTheme } = useTheme(); // Add this

  // Data Controls state - initialize with default values, will be updated from user profile
  const [allowLogging, setAllowLogging] = useState(true);
  const [allowTelemetry, setAllowTelemetry] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // State for Account content
  const [currentUsername, setCurrentUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);

  // ADD THESE NEW STATE VARIABLES
  const [isChangePasswordHovered, setIsChangePasswordHovered] = useState(false);
  const [isDeleteAccountHovered, setIsDeleteAccountHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  // Function to save data control settings
  const saveDataControlSettings = async (setting: 'allowLogging' | 'allowTelemetry', value: boolean) => {
    if (!user?.email) {
      return;
    }

    setIsUpdatingSettings(true);
    try {
      // Create updated settings object
      const updatedSettings = {
        allowLogging: setting === 'allowLogging' ? value : allowLogging,
        allowTelemetry: setting === 'allowTelemetry' ? value : allowTelemetry
      };
      
      const result = await updateUserSettings(user.email, updatedSettings);
      
      if (!result.success) {
        console.error('Failed to save settings:', result.message);
        // Revert the toggle state in case of failure
        if (setting === 'allowLogging') {
          setAllowLogging(!value);
        } else {
          setAllowTelemetry(!value);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // Revert the toggle state in case of error
      if (setting === 'allowLogging') {
        setAllowLogging(!value);
      } else {
        setAllowTelemetry(!value);
      }
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Helper function to get the first initial
  const getInitial = (name: string | undefined | null): string => {
    if (!name || name.trim().length === 0) {
      return '';
    }
    const words = name.trim().split(/\s+/);
    if (words.length >= 3) {
      return words[0][0].toUpperCase();
    } else if (words.length === 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length > 0) {
      return words[0][0].toUpperCase();
    }
    return ''; // Fallback for any other case (e.g. empty string after split)
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (user?.email) { 
        setIsLoadingProfile(true);
        setUsernameError('');
        setUsernameSuccess('');
        setIsEditingUsername(false);
        setCurrentUsername(user.username || '');
        setNewUsername(user.username || ''); 
        setCreatedAt(user.createdAt || null);
        
        try {
          const result = await getCurrentUserProfile();
          if (result.success && result.user) {
            const userProfile = result.user as UserProfile;
            setCurrentUsername(userProfile.username || '');
            setNewUsername(userProfile.username || '');
            setCreatedAt(userProfile.createdAt || null);
            
            // Load data control settings with fallback to defaults if not set
            setAllowLogging(userProfile.allowLogging !== undefined ? userProfile.allowLogging : true);
            setAllowTelemetry(userProfile.allowTelemetry !== undefined ? userProfile.allowTelemetry : true);
          } else {
            setUsernameError(result.message || 'Could not load latest profile details.');
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
          setUsernameError('Failed to load profile. Please try again.');
        } finally {
          setIsLoadingProfile(false);
        }
      } else if (!user?.email) {
        // If user is not logged in, clear fields and show appropriate message
        setIsLoadingProfile(false);
        setCurrentUsername('');
        setNewUsername('');
        setCreatedAt(null);
        setUsernameError('Please log in to view account details.');
        setUsernameSuccess(''); // Clear any previous success messages
      }
    };

    // Only load data if the menu is open and either the account or dataControls tab is active
    if (isOpen && (activeMenuItem === 'account' || activeMenuItem === 'dataControls')) {
      loadUserData();
    }
  }, [isOpen, activeMenuItem, user]);

  const handleLogout = async () => {
    await logoutUser();
    onClose();
  };

  const handleUpdateUsername = async () => {
    if (!user?.email) {
        setUsernameError('User email not found.');
        return;
    }
    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }
    if (newUsername.trim().length < 3 || newUsername.trim().length > 20) {
      setUsernameError('Username must be 3-20 characters');
      return;
    }

    setUsernameError('');
    setUsernameSuccess('');
    setIsLoadingUpdate(true);

    try {
      const result = await updateUserProfile(user.email, newUsername.trim());
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

  const handleSmallActionButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, isPrimary: boolean = true) => {
    if (!isLoadingUpdate) {
      const newStyle = accountModalStyles.smallActionButtonHover(isPrimary);
      if(newStyle.backgroundColor) e.currentTarget.style.backgroundColor = newStyle.backgroundColor;
    }
  };
  const handleSmallActionButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, isPrimary: boolean = true) => {
    if (!isLoadingUpdate) {
      const originalStyle = accountModalStyles.smallActionButton(isPrimary, false);
      if(originalStyle.backgroundColor) e.currentTarget.style.backgroundColor = originalStyle.backgroundColor;
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Define panel variants based on screen size
  const panelVariants = {
    hidden: isSmallScreen 
      ? { opacity: 0, y: '100%' } 
      : { opacity: 0, y: -30, scale: 0.95 },
    visible: isSmallScreen 
      ? { opacity: 1, y: '0%' } 
      : { opacity: 1, y: 0, scale: 1 },
    exit: isSmallScreen 
      ? { opacity: 0, y: '100%' } 
      : { opacity: 0, y: -30, scale: 0.95 },
  };

  // Define panel styles based on screen size
  const panelStyle: React.CSSProperties = {
    background: 'var(--card-background)',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative',
    display: 'flex',
    flexDirection: isSmallScreen ? 'column' : 'row',
    overflow: 'hidden',
    ...(isSmallScreen
      ? {
          width: '100vw',
          height: '85vh',
          borderRadius: '20px 20px 0 0',
          borderTop: '1px solid var(--border)',
          paddingTop: '40px',
        }
      : {
          width: '960px',
          height: '540px',
          borderRadius: '32px',
        }
    )
  };
  
  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: isSmallScreen ? 'flex-end' : 'center',
    zIndex: 1050,
  };

  const sidebarStyle: React.CSSProperties = {
    width: isSmallScreen ? '100%' : '240px',
    padding: '20px',
    borderRight: isSmallScreen ? 'none' : '1px solid var(--border)',
    borderBottom: isSmallScreen ? '1px solid var(--border)' : 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
    backgroundColor: isSmallScreen ? 'var(--card-background)' : 'var(--background-secondary)',
  };

  const contentAreaStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--card-background)',
  };

  const menuItemButtonStyle = (itemId: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: activeMenuItem === itemId ? 'var(--secondary)' : 'transparent',
    border: 'none',
    textAlign: 'left',
    width: '100%',
    fontSize: '16px',
    color: activeMenuItem === itemId ? 'var(--foreground)' : 'var(--foreground-secondary)',
    fontWeight: activeMenuItem === itemId ? '600' : '500',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  });

  const mobileMenuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    width: '100%',
    fontSize: '16px',
    color: 'var(--foreground)',
  };

  const iconStyle: React.CSSProperties = {
    marginRight: '12px',
    fontSize: '20px',
    color: 'var(--foreground-secondary)',
  };
   const activeIconStyle: React.CSSProperties = {
    ...iconStyle,
    color: 'var(--primary)',
  };

  const handleMobileMenuItemClick = (itemId: string) => {
    setActiveMenuItem(itemId);
    setCurrentView('subpage');
  };

  const handleBackToMainMenu = () => {
    setCurrentView('main');
  };

  const renderAccountContent = () => {
    if (!user?.email) {
      return <div style={accountModalStyles.loadingContainer}><div style={accountModalStyles.loadingText}>Please log in to view account details.</div></div>;
    }
    
    const userInitial = getInitial(currentUsername);

    return (
      <div style={accountModalStyles.accountPageContainer}>
        <div style={{...accountModalStyles.headerSection, borderBottom: isSmallScreen ? '1px solid var(--border)' : 'none'}}>
          <div style={{...accountModalStyles.avatarContainer, fontSize: '1.5rem', fontWeight: 'bold' }}> {/* Added fontSize and fontWeight for initial */}
            {isLoadingProfile ? 
              <LuUser size={28} /> : // Show icon while loading
              (userInitial ? userInitial : <LuUser size={28} />)
            }
          </div>
          <h2 style={accountModalStyles.title}>
            {isLoadingProfile ? 
              'Loading...' : 
              (currentUsername || (user?.email ? 'User Profile' : 'Account'))
            }
          </h2>
          <p style={accountModalStyles.emailText}>{user.email}</p>
          {createdAt && (
            <p style={accountModalStyles.accountIdText}>
              <span style={accountModalStyles.accountIdLabel}>Account ID:</span> {String(createdAt)} {/* Display raw timestamp */}
            </p>
          )}
          {createdAt && (
            <div style={accountModalStyles.createdAtContainer}>
              <LuClock size={13} style={{ marginRight: '0.25rem' }} />
              <span title={formatFullDate(createdAt)}>Account created {formatRelativeTime(createdAt)}</span>
            </div>
          )}
        </div>

        {isLoadingProfile ? (
          <div style={accountModalStyles.loadingContainer}><div style={accountModalStyles.loadingText}>Loading account data...</div></div>
        ) : (
          <div style={accountModalStyles.mainContentLayout(isSmallScreen)}>
            {/* Left Column (Username) or Full Width on Mobile */} 
            <div style={isSmallScreen ? {} : accountModalStyles.leftColumn}>
              <div style={accountModalStyles.usernameSection}>
                {isEditingUsername ? (
                  <div style={accountModalStyles.usernameEditContainerSpaceY}>
                     <label htmlFor="usernameInput" style={accountModalStyles.usernameLabel}>Edit Username</label>
                    <input 
                      id="usernameInput"
                      type="text" 
                      value={newUsername} 
                      onChange={(e) => setNewUsername(e.target.value)} 
                      style={accountModalStyles.inputField(!!usernameError, usernameFocused)}
                      placeholder="Enter new username" 
                      maxLength={20}
                      onFocus={() => setUsernameFocused(true)} 
                      onBlur={() => setUsernameFocused(false)} 
                    />
                    {usernameError && (
                      <p style={accountModalStyles.errorText}>
                        <LuTriangle size={13} style={{ marginRight: '0.25rem'}} />
                        {usernameError}
                      </p>
                    )}
                    <div style={accountModalStyles.editActionsGroup}>
                      <button 
                          onClick={handleUpdateUsername} 
                          disabled={isLoadingUpdate} 
                          style={accountModalStyles.smallActionButton(true, isLoadingUpdate)}
                          onMouseEnter={(e) => handleSmallActionButtonMouseEnter(e, true)}
                          onMouseLeave={(e) => handleSmallActionButtonMouseLeave(e, true)} >
                        {isLoadingUpdate ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                          onClick={() => { setIsEditingUsername(false); setNewUsername(currentUsername); setUsernameError(''); setUsernameSuccess(''); }}
                          style={accountModalStyles.smallActionButton(false, isLoadingUpdate)}
                          onMouseEnter={(e) => handleSmallActionButtonMouseEnter(e, false)}
                          onMouseLeave={(e) => handleSmallActionButtonMouseLeave(e, false)} 
                          disabled={isLoadingUpdate} >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                  <div style={accountModalStyles.usernameDisplayContainer}>
                    <div style={accountModalStyles.usernameLabelAndValue}>
                        <p style={accountModalStyles.usernameLabel}>Username</p>
                        <p style={accountModalStyles.currentUsernameText}>{currentUsername || 'Not set'}</p>
                    </div>
                    <button 
                        onClick={() => { setIsEditingUsername(true); setUsernameSuccess(''); }}
                        style={accountModalStyles.editButton} 
                        onMouseEnter={(e) => { e.currentTarget.style.color = accountModalStyles.editButtonHover.color as string; e.currentTarget.style.backgroundColor = accountModalStyles.editButtonHover.backgroundColor as string;}} 
                        onMouseLeave={(e) => { e.currentTarget.style.color = (accountModalStyles.editButton as CSSProperties).color as string; e.currentTarget.style.backgroundColor = 'transparent';}}
                        aria-label="Edit username"
                    >
                        <LuPencil size={16} />
                    </button>
                    </div>
                    {usernameSuccess && (
                        <p style={{...accountModalStyles.successText, marginTop: '0.5rem'}}>
                            <LuCheck size={14} style={{ marginRight: '0.25rem'}}/>
                            {usernameSuccess}
                        </p>
                    )}
                  </>
                )}
              </div>
              {/* Add other left column items here if any */} 
            </div>

            {/* Right Column (Actions) or Full Width on Mobile */} 
            <div style={isSmallScreen ? { display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' } : accountModalStyles.rightColumn }>
              <button 
                onClick={() => setIsChangePasswordOpen(true)} 
                style={isChangePasswordHovered ? accountModalStyles.mainActionButtonHover('default') : accountModalStyles.mainActionButton('default')} 
                onMouseEnter={() => setIsChangePasswordHovered(true)}
                onMouseLeave={() => setIsChangePasswordHovered(false)}
              >
                <LuKey size={16} />
                <span>Change Password</span>
              </button>
            
              <button 
                onClick={() => setIsDeleteConfirmOpen(true)} 
                style={isDeleteAccountHovered ? accountModalStyles.mainActionButtonHover('danger') : accountModalStyles.mainActionButton('danger')}
                onMouseEnter={() => setIsDeleteAccountHovered(true)}
                onMouseLeave={() => setIsDeleteAccountHovered(false)}
              >
                <LuShieldAlert size={16} />
                <span>Delete Account</span>
              </button>

              <button 
                onClick={handleLogout} 
                style={isLogoutHovered ? accountModalStyles.mainActionButtonHover('default') : accountModalStyles.mainActionButton('default')}
                onMouseEnter={() => setIsLogoutHovered(true)}
                onMouseLeave={() => setIsLogoutHovered(false)}
              >
                <LuLogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAppearanceContent = () => {
    const ThemeOption: React.FC<ThemeOptionProps> = ({ mode, currentTheme, onClick, icon, label, description, isSmallScreen }) => {
      const isSelected = mode === currentTheme;
      
      return (
        <div 
          onClick={() => onClick(mode)}
          style={{
            display: 'flex',
            padding: '1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            backgroundColor: isSelected ? 'var(--accent)' : 'var(--card-background)',
            border: `1px solid ${isSelected ? 'var(--accent-foreground)' : 'var(--card-border)'}`,
            marginBottom: '1rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.backgroundColor = 'var(--secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.backgroundColor = 'var(--card-background)';
            }
          }}
        >
          <div style={{ 
            marginRight: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '1.5rem', 
            color: isSelected ? 'var(--accent-foreground)' : 'var(--foreground-secondary)' 
          }}>
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: 600, 
              marginBottom: '0.25rem', 
              color: isSelected ? 'var(--accent-foreground)' : 'var(--foreground)' 
            }}>
              {label}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: isSelected ? 'var(--accent-foreground)' : 'var(--foreground-secondary)' 
            }}>
              {description}
            </div>
          </div>
          {isSelected && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: 'var(--accent-foreground)'
            }}>
              <LuCheck size={20} />
            </div>
          )}
        </div>
      );
    };

    return (
      <div style={{ padding: '1.25rem', color: 'var(--foreground)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--foreground)' }}>
          Appearance
        </h2>
        <p style={{ marginBottom: '1.5rem', fontSize: '0.9375rem', color: 'var(--foreground-secondary)' }}>
          Customize how VEO looks on your device.
        </p>

        <ThemeOption
          mode="system"
          currentTheme={theme}
          onClick={setTheme}
          icon={<LuMonitor />}
          label="System"
          description="Follow your system's theme preferences"
          isSmallScreen={isSmallScreen}
        />

        <ThemeOption
          mode="light"
          currentTheme={theme}
          onClick={setTheme}
          icon={<LuSun />}
          label="Light"
          description="Always use light theme"
          isSmallScreen={isSmallScreen}
        />

        <ThemeOption
          mode="dark"
          currentTheme={theme}
          onClick={setTheme}
          icon={<LuMoon />}
          label="Dark"
          description="Always use dark theme"
          isSmallScreen={isSmallScreen}
        />
      </div>
    );
  };

  const renderAboutContent = () => {
    return (
      <div style={{ padding: '1.25rem', color: 'var(--foreground)' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '1.5rem', 
          color: 'var(--foreground)',
          textAlign: 'center' 
        }}>
          About VEO
        </h2>
        
        <div style={{ 
          backgroundColor: 'var(--card-background)', 
          border: '1px solid var(--card-border)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '1.5rem' 
          }}>
            <img 
              src="/main_full.png" 
              alt="VEO Logo" 
              style={{ 
                width: '80px', 
                height: '80px',
                filter: theme === 'dark' ? 'invert(1) brightness(1)' : 'none'
              }} 
            />
          </div>
          
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1rem', 
            color: 'var(--foreground)',
            textAlign: 'center' 
          }}>
            VEO 1.0
          </h3>
          
          <p style={{ 
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: 'var(--foreground)',
            fontSize: '0.95rem',
            textAlign: 'center'
          }}>
            VEO is an advanced AI assistant designed to enhance your productivity and simplify everyday tasks.
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              backgroundColor: 'var(--background-secondary)',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h4 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: 'var(--foreground)',
                marginBottom: '0.25rem'
              }}>Capabilities</h4>
              <p style={{ 
                fontSize: '0.875rem',
                color: 'var(--foreground-secondary)',
                lineHeight: '1.5'
              }}>
                Powered by the latest LLM architecture, VEO excels at answering questions, 
                fact-checking, providing news updates, and assisting with research. With a 
                200,000 token context window, VEO maintains detailed conversations and handles 
                complex topics with ease.
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              backgroundColor: 'var(--background-secondary)',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <h4 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: 'var(--foreground)',
                marginBottom: '0.25rem'
              }}>Purpose</h4>
              <p style={{ 
                fontSize: '0.875rem',
                color: 'var(--foreground-secondary)',
                lineHeight: '1.5'
              }}>
                VEO was created to be your reliable companion for learning, information retrieval, 
                creative assistance, and productivity enhancement. From answering simple questions 
                to helping with complex projects.
              </p>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1rem',
            fontSize: '0.875rem',
            color: 'var(--foreground-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <p style={{ margin: 0 }}>Version 1.0 - 20 May 2025</p>
            <p style={{ margin: 0 }}>Created by professional_idiot_25</p>
            <p style={{ margin: 0, fontSize: '0.75rem' }}>© 2025 VEO AI Assistant</p>
          </div>
        </div>
      </div>
    );
  };

  const renderDataControlsContent = () => {
    // Toggle switch component for data controls
    const Toggle: React.FC<{
      isOn: boolean;
      onToggle: () => void;
      label: string;
      description: string;
      icon: React.ReactNode;
      disabled?: boolean;
    }> = ({ isOn, onToggle, label, description, icon, disabled = false }) => (
      <div style={{
        display: 'flex',
        padding: '1.25rem',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--card-background)',
        border: '1px solid var(--card-border)',
        marginBottom: '1rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.7 : 1,
      }}
      onClick={disabled ? undefined : onToggle}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'var(--secondary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'var(--card-background)';
        }
      }}
      >
        <div style={{ 
          marginRight: '1rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '1.5rem', 
          color: 'var(--foreground-secondary)' 
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 600, 
            marginBottom: '0.375rem', 
            color: 'var(--foreground)' 
          }}>
            {label}
          </div>
          <div style={{ 
            fontSize: '0.875rem', 
            color: 'var(--foreground-secondary)',
            lineHeight: '1.5'
          }}>
            {description}
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '0.25rem'
        }}>
          <div style={{
            width: '42px',
            height: '24px',
            backgroundColor: isOn ? 'var(--primary)' : 'var(--input-border)',
            borderRadius: '12px',
            position: 'relative',
            transition: 'background-color 0.3s',
          }}>
            <div style={{
              position: 'absolute',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: 'white',
              top: '3px',
              left: isOn ? '21px' : '3px',
              transition: 'left 0.3s',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            }} />
          </div>
        </div>
      </div>
    );

    // Check if user is logged in
    const userLoggedIn = !!user?.email;

    return (
      <div style={{ padding: '1.25rem', color: 'var(--foreground)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--foreground)' }}>
          Data Controls
        </h2>
        <p style={{ marginBottom: '1.5rem', fontSize: '0.9375rem', color: 'var(--foreground-secondary)' }}>
          Manage how your data is used within VEO. {!userLoggedIn && "Log in to save these preferences across devices."}
        </p>

        {isLoadingProfile ? (
          <div style={{
            padding: '2rem 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'var(--foreground-secondary)',
            fontSize: '0.9375rem'
          }}>
            Loading your preferences...
          </div>
        ) : (
          <>
            <Toggle
              isOn={allowLogging}
              onToggle={() => {
                const newValue = !allowLogging;
                setAllowLogging(newValue);
                if (userLoggedIn) {
                  saveDataControlSettings('allowLogging', newValue);
                }
              }}
              icon={<LuClipboard />}
              label="Allow messages to be logged"
              description="Your conversations may be stored and reviewed to train our AI models and improve our services. All data is anonymized and handled according to our privacy policy."
              disabled={isUpdatingSettings || !userLoggedIn}
            />

            <Toggle
              isOn={allowTelemetry}
              onToggle={() => {
                const newValue = !allowTelemetry;
                setAllowTelemetry(newValue);
                if (userLoggedIn) {
                  saveDataControlSettings('allowTelemetry', newValue);
                }
              }}
              icon={<LuActivity />}
              label="Allow telemetry logging"
              description="Help us improve VEO by allowing us to collect anonymous usage data. This information helps us understand how our features are being used and identify areas for improvement."
              disabled={isUpdatingSettings || !userLoggedIn}
            />
            
            {!userLoggedIn && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--accent)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--accent-foreground)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <LuInfo size={18} />
                <span>To save your data control preferences across devices, please log in to your account.</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderCustomizationContent = () => {
    return (
      <div style={{ 
        padding: '2rem 1.5rem', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100%',
        color: 'var(--foreground)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <LuWand size={36} color="var(--accent-foreground)" />
        </div>
        
        <h2 style={{ 
          fontSize: '1.75rem', 
          fontWeight: '700', 
          marginBottom: '1rem', 
          color: 'var(--foreground)',
          background: 'linear-gradient(45deg, var(--primary), var(--primary-hover))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Coming Soon
        </h2>
        
        <p style={{ 
          fontSize: '1.125rem', 
          lineHeight: '1.6', 
          maxWidth: '500px', 
          color: 'var(--foreground-secondary)',
          marginBottom: '2rem'
        }}>
          I'm still working on customization features to make VEO truly personalized for you.
          Stay tuned for personalization options in a future update.
        </p>
        
        <div style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: 'var(--secondary)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--foreground)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <LuInfo size={16} />
          <span>Expected release: June 2025</span>
        </div>
      </div>
    );
  };

  const renderSubpageContent = (selectedItem: { id: string; name: string; icon: React.ElementType } | undefined) => {
    if (selectedItem?.id === 'account') {
      return renderAccountContent();
    }
    if (selectedItem?.id === 'appearance') {
      return renderAppearanceContent();
    }
    if (selectedItem?.id === 'about') {
      return renderAboutContent();
    }
    if (selectedItem?.id === 'dataControls') {
      return renderDataControlsContent();
    }
    if (selectedItem?.id === 'customization') {
      return renderCustomizationContent();
    }
    // Default content for other subpages
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--foreground-secondary)', marginTop: '40px' }}>
        {selectedItem?.name} content will appear here
      </div>
    );
  };

  const renderMobileSubpage = () => {
    const selectedItem = menuItems.find(item => item.id === activeMenuItem);
    // Determine the title for the mobile subpage header
    let mobileHeaderTitle = selectedItem?.name;
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          padding: '10px 10px 10px 10px',
          borderBottom: '1px solid var(--border)'
        }}>
          <button
            onClick={handleBackToMainMenu}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              color: 'var(--foreground-secondary)'
            }}
          >
            <LuArrowLeft size={20} />
          </button>
          <h2 style={{ flexGrow:1, textAlign:'center', fontWeight: '600', fontSize: '18px', margin: 0, color: 'var(--foreground)' }}>
            {mobileHeaderTitle}
          </h2>
           <div style={{width: '30px'}} />
        </div>
        {/* Ensure this container fills available space and is scrollable */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {renderSubpageContent(selectedItem)}
        </div>
      </div>
    );
  };

  const renderMobileMainMenu = () => {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          padding: '15px 20px',
          borderBottom: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontWeight: '600', fontSize: '20px', margin: 0, color: 'var(--foreground)' }}>Settings</h2>
        </div>
        
        <div style={{ overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                style={mobileMenuItemStyle}
                onClick={() => handleMobileMenuItemClick(item.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IconComponent size={20} style={{ marginRight: '15px', color: 'var(--foreground-secondary)' }} />
                  <span style={{ color: 'var(--foreground)' }}>{item.name}</span>
                </div>
                <LuChevronRight size={18} style={{ color: 'var(--foreground-secondary)' }} />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const closeButton: React.CSSProperties = {
    position: 'absolute',
    top: isSmallScreen ? '10px' : '15px',
    right: isSmallScreen ? '10px' : '15px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    zIndex: 1001,
    color: 'var(--foreground-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  
  const closeButtonHover: React.CSSProperties = {
    color: 'var(--foreground)',
    backgroundColor: 'var(--secondary)'
  };
  
  // Mobile view header
  const mobileHeaderStyle: React.CSSProperties = {
    display: 'flex', 
    alignItems: 'center',
    padding: '10px 10px 10px 10px',
    borderBottom: '1px solid var(--border)'
  };
  
  const mobileBackButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    color: 'var(--foreground-secondary)'
  };
  
  const mobileHeaderTitleStyle: React.CSSProperties = {
    flexGrow: 1, 
    textAlign: 'center', 
    fontWeight: 600, 
    fontSize: '18px', 
    margin: 0, 
    color: 'var(--foreground)'
  };

  const mainMenuHeaderStyle: React.CSSProperties = {
    padding: '15px 20px',
    borderBottom: '1px solid var(--border)',
    textAlign: 'center'
  };
  
  const mainMenuTitleStyle: React.CSSProperties = {
    fontWeight: 600, 
    fontSize: '20px', 
    margin: 0, 
    color: 'var(--foreground)'
  };

  return (
    <>
    <motion.div
      key="menu-backdrop-wrapper"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2 }}
      style={backdropStyle}
      onClick={onClose}
    >
      <motion.div
        key="menu-panel"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={closeButton}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground-secondary)'}
          aria-label="Close menu"
        >
          <LuX size={isSmallScreen ? 22 : 24} />
        </button>

        {!isSmallScreen && (
          <>
            <div style={sidebarStyle}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', paddingLeft: '0px', color: 'var(--foreground)' }}>Settings</h2>
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeMenuItem === item.id;
                return (
                  <button
                    key={item.id}
                    style={menuItemButtonStyle(item.id)}
                    onClick={() => setActiveMenuItem(item.id)}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--secondary)'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <IconComponent style={isActive ? activeIconStyle : iconStyle} />
                    {item.name}
                  </button>
                );
              })}
            </div>
            <div style={contentAreaStyle}>
              {activeMenuItem === 'account' ? renderAccountContent() : renderSubpageContent(menuItems.find(m => m.id === activeMenuItem))}
            </div>
          </>
        )}

        {isSmallScreen && (
          <AnimatePresence mode="wait">
            {currentView === 'main' ? (
              <motion.div 
                key="main-menu"
                initial={{ opacity: 0, x: isSmallScreen ? 0 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isSmallScreen ? 0 : -20 }}
                transition={{ duration: 0.2 }}
                style={{ width: '100%', height: '100%', display:'flex', flexDirection:'column' }}
              >
                {renderMobileMainMenu()}
              </motion.div>
            ) : (
              <motion.div 
                key="subpage"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ width: '100%', height: '100%', display:'flex', flexDirection:'column' }}
              >
                {renderMobileSubpage()}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
    
    <React.Fragment>
      {user?.email && (
        <>
          <ChangePasswordModal
            isOpen={isChangePasswordOpen}
            onClose={() => setIsChangePasswordOpen(false)}
            userEmail={user.email} 
            onSuccess={() => {
              setIsChangePasswordOpen(false);
            }}
          />
          <DeleteAccountConfirmationModal
            isOpen={isDeleteConfirmOpen}
            onClose={() => {
                setIsDeleteConfirmOpen(false);
            }}
            userEmail={user.email}
          />
        </>
      )}
       
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </React.Fragment>
  </>
  );
};

export default Menu; 