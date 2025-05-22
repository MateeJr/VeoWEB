'use client';

import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { LuMenu, LuUser, LuHistory, LuChevronDown, LuMessageSquare, LuEye, LuEyeOff, LuDollarSign } from 'react-icons/lu';
import { Tooltip } from 'react-tooltip';
import { useAuth, User } from '../utils/auth';
import LoginModal from './LoginModal';
import { useIncognito } from '../contexts/IncognitoContext';
import Menu from './Menu';
import HistoryPanel from './HistoryPanel';
import PricingPanel from './PricingPanel';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { usePathname } from 'next/navigation';
import { loadConversation } from '../utils/HistoryManager';

// Define header height as a constant
const HEADER_HEIGHT = '72px';

const Header = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);

  const { user, loggedIn, loading } = useAuth();
  const { isIncognitoMode, toggleIncognitoMode } = useIncognito();
  const { resolvedTheme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenuPanel, setShowMenuPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showPricingPanel, setShowPricingPanel] = useState(false);
  const [menuInitialTab, setMenuInitialTab] = useState<string | undefined>(undefined);
  const pathname = usePathname();

  // State for mobile long-press tooltips
  const [mobileTooltipTargetId, setMobileTooltipTargetId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number, y: number } | null>(null); // For touchMove threshold

  // Check if current page is a chat page and fetch conversation title
  useEffect(() => {
    const fetchConversationTitle = async () => {
      // Handle existing chat pages with ID
      if (pathname && pathname.startsWith('/chat/')) {
        const conversationId = pathname.split('/')[2];
        if (conversationId && user?.createdAt) {
          try {
            const conversation = await loadConversation(user.createdAt.toString(), conversationId);
            if (conversation) {
              setConversationTitle(conversation.title);
              return;
            }
          } catch (error) {
            console.error('Failed to load conversation for header:', error);
          }
        } 
        // Handle main page (new chat)
        else if (pathname === '/') {
          setConversationTitle('New Conversation');
          return;
        }
        // If not a chat page or failed to load, clear the title
        setConversationTitle(null);
      }
    };

    fetchConversationTitle();
  }, [pathname, user]);

  const iconButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.1s ease, background-color 0.2s ease',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '22px',
    color: 'var(--foreground)',
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(0.9)';
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        accountButtonRef.current &&
        !accountButtonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const closeModals = () => {
      setShowLoginModal(false);
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModals();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) {
      setMobileTooltipTargetId(null); // Hide tooltip when dropdown closes
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, [isDropdownOpen]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Close tooltips when clicking outside buttons
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      // Only run this on mobile
      if (!isSmallScreen || !mobileTooltipTargetId) return;
      
      // Check if click is on a button or inside a tooltip
      const target = event.target as HTMLElement;
      const isButtonOrTooltip = (
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('[data-tooltip-id]') ||
        target.closest('.react-tooltip')
      );
      
      if (!isButtonOrTooltip) {
        setMobileTooltipTargetId(null);
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isSmallScreen, mobileTooltipTargetId]);

  const handleMobileItemTouchStart = (e: React.TouchEvent<HTMLButtonElement>, buttonId: string) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    longPressTimerRef.current = setTimeout(() => {
      setMobileTooltipTargetId(buttonId);
      longPressTimerRef.current = null; 
    }, 500); // 500ms for long press
  };

  const handleMobileItemTouchEnd = (buttonId: string) => {
    if (longPressTimerRef.current) { // Timer was pending (short tap)
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      // If a tooltip for this button is already open from a previous long press,
      // and this is a short tap, then close it.
      if (mobileTooltipTargetId === buttonId) {
        setMobileTooltipTargetId(null);
      }
    } 
    else if (mobileTooltipTargetId === buttonId) {
      // If tooltip is showing (long press completed), close it after a short delay
      // This allows the tooltip to be visible when clicking the button
      setTimeout(() => {
        setMobileTooltipTargetId(null);
      }, 1500); // 1.5 seconds to keep tooltip visible after tap
    }
    // If long press timer already fired, mobileTooltipTargetId is set.
    // The original onClick for the button will handle its action.
    // Tooltip will close if dropdown closes or via outside click if Tooltip component handles it.
    touchStartPosRef.current = null;
  };

  const handleMobileItemTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (longPressTimerRef.current && touchStartPosRef.current) {
      const threshold = 10; // pixels
      const deltaX = Math.abs(e.touches[0].clientX - touchStartPosRef.current.x);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartPosRef.current.y);
      if (deltaX > threshold || deltaY > threshold) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        touchStartPosRef.current = null;
      }
    }
  };

  const handleAccountButtonClick = () => {
    if (isSmallScreen) {
      setIsDropdownOpen(prev => !prev);
    } else {
      if (!loggedIn) {
        setShowLoginModal(true);
      } else {
        setMenuInitialTab('account');
        setShowMenuPanel(true);
      }
    }
  };

  const handleHistoryButtonClick = () => {
    setShowHistoryPanel(true);
  };

  const handlePricingButtonClick = () => {
    setShowPricingPanel(true);
  };

  const dropdownItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    color: 'var(--foreground)',
    textDecoration: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    width: '100%',
    transition: 'background-color 0.1s ease, transform 0.1s ease',
  };

  const dropdownListItemIconStyle: React.CSSProperties = {
    fontSize: '18px',
    color: 'var(--foreground-secondary)',
    marginRight: '12px',
  };

  const handleDropdownItemMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--secondary)';
    e.currentTarget.style.transform = 'scale(0.98)';
  };

  const handleDropdownItemMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isHovering = e.currentTarget.matches(':hover');
    e.currentTarget.style.backgroundColor = isHovering ? 'var(--secondary-hover)' : 'transparent';
    e.currentTarget.style.transform = 'scale(1)';
  };

  const onDropdownItemClick = (action: string) => {
    console.log(`${action} clicked`);
    setIsDropdownOpen(false);
    if (action === 'account') {
        if (loggedIn) {
            setMenuInitialTab('account');
            setShowMenuPanel(true);
        } else {
            setShowLoginModal(true);
        }
    } else if (action === 'history' || action === 'history_small') {
        setShowHistoryPanel(true);
    } else if (action === 'pricing_small') {
        setShowPricingPanel(true);
    }
  };

  // Add handler for logo and text clicks, same as New Chat button in ChatBox.tsx
  const handleNewChat = () => {
    // Refresh the page by redirecting to the homepage
    window.location.href = '/';
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: HEADER_HEIGHT,
          background: 'var(--background)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '20px',
          paddingRight: '20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {hasMounted && (
            <img 
              src="/main_full.png" 
              alt="VEO Logo" 
              style={{ 
                width: '50px', 
                height: '50px', 
                marginRight: isSmallScreen ? '0px' : '10px',
                filter: resolvedTheme === 'dark' ? 'invert(1) brightness(1)' : 'none',
                cursor: 'pointer' // Add cursor pointer to indicate it's clickable
              }} 
              onClick={handleNewChat} // Add click handler to logo
            />
          )}
          {!isSmallScreen && (
            <button
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: 'inherit', // Inherit color from parent
                transition: 'transform 0.1s ease', // Added for click effect
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseLeave={(e) => { // Reset if mouse leaves while pressed
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onClick={handleNewChat} // Add click handler to VEO text
            >
              VEO
            </button>
          )}
        </div>

        {conversationTitle && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--foreground)',
              maxWidth: '50%',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
            title={conversationTitle}
          >
            {conversationTitle}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          {isSmallScreen ? (
            <button
              ref={accountButtonRef}
              style={iconButtonStyle}
              onClick={handleAccountButtonClick}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              aria-label="Open menu"
            >
              <LuMenu style={iconStyle} />
            </button>
          ) : (
            <>
              <button
                style={iconButtonStyle}
                data-tooltip-id="header-tooltip"
                data-tooltip-content={isIncognitoMode ? "Disable Incognito Chat" : "Enable Incognito Chat"}
                data-tooltip-place="bottom"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={toggleIncognitoMode}
                onTouchStart={isSmallScreen ? (e) => handleMobileItemTouchStart(e, 'incognito-button') : undefined}
                onTouchEnd={isSmallScreen ? () => handleMobileItemTouchEnd('incognito-button') : undefined}
                onTouchMove={isSmallScreen ? handleMobileItemTouchMove : undefined}
              >
                {isIncognitoMode ? <LuEye style={iconStyle} /> : <LuEyeOff style={iconStyle} />}
              </button>
              <button
                style={iconButtonStyle}
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Chat History"
                data-tooltip-place="bottom"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleHistoryButtonClick}
                onTouchStart={isSmallScreen ? (e) => handleMobileItemTouchStart(e, 'history-button') : undefined}
                onTouchEnd={isSmallScreen ? () => handleMobileItemTouchEnd('history-button') : undefined}
                onTouchMove={isSmallScreen ? handleMobileItemTouchMove : undefined}
              >
                <LuHistory style={iconStyle} />
              </button>
              <button
                style={iconButtonStyle}
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Pricing"
                data-tooltip-place="bottom"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handlePricingButtonClick}
                onTouchStart={isSmallScreen ? (e) => handleMobileItemTouchStart(e, 'pricing-button') : undefined}
                onTouchEnd={isSmallScreen ? () => handleMobileItemTouchEnd('pricing-button') : undefined}
                onTouchMove={isSmallScreen ? handleMobileItemTouchMove : undefined}
              >
                <LuDollarSign style={iconStyle} />
              </button>
              <button
                style={iconButtonStyle}
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Menu"
                data-tooltip-place="bottom"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => {
                  setMenuInitialTab(undefined);
                  setShowMenuPanel(true);
                }}
                onTouchStart={isSmallScreen ? (e) => handleMobileItemTouchStart(e, 'menu-button') : undefined}
                onTouchEnd={isSmallScreen ? () => handleMobileItemTouchEnd('menu-button') : undefined}
                onTouchMove={isSmallScreen ? handleMobileItemTouchMove : undefined}
              >
                <LuMenu style={iconStyle} />
              </button>
              {!loggedIn && (
                <button
                  style={iconButtonStyle}
                  data-tooltip-id="header-tooltip"
                  data-tooltip-content="Login / Sign Up"
                  data-tooltip-place="bottom"
                  onClick={() => setShowLoginModal(true)}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={isSmallScreen ? (e) => handleMobileItemTouchStart(e, 'login-button') : undefined}
                  onTouchEnd={isSmallScreen ? () => handleMobileItemTouchEnd('login-button') : undefined}
                  onTouchMove={isSmallScreen ? handleMobileItemTouchMove : undefined}
                >
                  <LuUser style={iconStyle} />
                </button>
              )}
            </>
          )}
          {isSmallScreen && isDropdownOpen && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                background: 'var(--card-background)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1001,
                width: '220px',
                overflow: 'hidden',
                border: '1px solid var(--card-border)'
              }}
            >
              <button
                id="mobile-dropdown-account"
                style={{...dropdownItemStyle, borderBottom: '1px solid var(--border)'}}
                onMouseDown={handleDropdownItemMouseDown}
                onMouseUp={handleDropdownItemMouseUp}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)';}}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--secondary)';}}
                onClick={() => onDropdownItemClick('account')}
                onTouchStart={(e) => handleMobileItemTouchStart(e, 'mobile-dropdown-account')}
                onTouchEnd={() => handleMobileItemTouchEnd('mobile-dropdown-account')}
                onTouchMove={(e) => handleMobileItemTouchMove(e)}
              >
                <LuUser style={dropdownListItemIconStyle} />
                {loading ? "Account" : (loggedIn ? 'Account' : 'Login / Sign Up')}
              </button>
              <button
                id="mobile-dropdown-incognito"
                style={{...dropdownItemStyle, borderBottom: '1px solid var(--border)'}}
                onMouseDown={handleDropdownItemMouseDown}
                onMouseUp={handleDropdownItemMouseUp}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)';}}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--secondary)';}}
                onClick={() => { onDropdownItemClick('incognito_chat_small'); toggleIncognitoMode(); }}
                onTouchStart={(e) => handleMobileItemTouchStart(e, 'mobile-dropdown-incognito')}
                onTouchEnd={() => handleMobileItemTouchEnd('mobile-dropdown-incognito')}
                onTouchMove={(e) => handleMobileItemTouchMove(e)}
              >
                {isIncognitoMode ? <LuEye style={dropdownListItemIconStyle} /> : <LuEyeOff style={dropdownListItemIconStyle} />}
                {isIncognitoMode ? "Incognito (On)" : "Incognito Chat"}
              </button>
              <button
                id="mobile-dropdown-history"
                style={{...dropdownItemStyle, borderBottom: '1px solid var(--border)'}}
                onMouseDown={handleDropdownItemMouseDown}
                onMouseUp={handleDropdownItemMouseUp}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)';}}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--secondary)';}}
                onClick={() => onDropdownItemClick('history_small')}
                onTouchStart={(e) => handleMobileItemTouchStart(e, 'mobile-dropdown-history')}
                onTouchEnd={() => handleMobileItemTouchEnd('mobile-dropdown-history')}
                onTouchMove={(e) => handleMobileItemTouchMove(e)}
              >
                <LuHistory style={dropdownListItemIconStyle} />
                Chat History
              </button>
              <button
                id="mobile-dropdown-pricing"
                style={{...dropdownItemStyle, borderBottom: '1px solid var(--border)'}}
                onMouseDown={handleDropdownItemMouseDown}
                onMouseUp={handleDropdownItemMouseUp}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)';}}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--secondary)';}}
                onClick={() => onDropdownItemClick('pricing_small')}
                onTouchStart={(e) => handleMobileItemTouchStart(e, 'mobile-dropdown-pricing')}
                onTouchEnd={() => handleMobileItemTouchEnd('mobile-dropdown-pricing')}
                onTouchMove={(e) => handleMobileItemTouchMove(e)}
              >
                <LuDollarSign style={dropdownListItemIconStyle} />
                Pricing
              </button>
              <button
                id="mobile-dropdown-menu"
                style={dropdownItemStyle}
                onMouseDown={handleDropdownItemMouseDown}
                onMouseUp={handleDropdownItemMouseUp}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)';}}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--secondary)';}}
                onClick={() => {
                  setMenuInitialTab(undefined);
                  setShowMenuPanel(true);
                  setIsDropdownOpen(false);
                  console.log('menu_small clicked');
                }}
                onTouchStart={(e) => handleMobileItemTouchStart(e, 'mobile-dropdown-menu')}
                onTouchEnd={() => handleMobileItemTouchEnd('mobile-dropdown-menu')}
                onTouchMove={(e) => handleMobileItemTouchMove(e)}
              >
                <LuMenu style={dropdownListItemIconStyle} />
                Menu
              </button>
            </div>
          )}
        </div>
        <Tooltip 
          id="header-tooltip" 
          variant="light"
          style={{
            zIndex: 9999,
            borderRadius: '8px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
          }}
          clickable={isSmallScreen}
          delayShow={isSmallScreen ? 9999999 : undefined}
        />
      </header>
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
      <AnimatePresence>
        {showMenuPanel && (
          <Menu
            isOpen={showMenuPanel}
            onClose={() => {
              setShowMenuPanel(false);
              setMenuInitialTab(undefined); // Reset initialTab when closing
            }}
            isSmallScreen={isSmallScreen}
            initialTab={menuInitialTab}
          />
        )}
      </AnimatePresence>
      
      <HistoryPanel 
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        isSmallScreen={isSmallScreen}
        onOpenLoginModal={() => setShowLoginModal(true)}
        headerHeight={HEADER_HEIGHT} // Pass the header height to HistoryPanel
      />
      
      {/* Pricing Panel Modal */}
      <AnimatePresence>
        {showPricingPanel && (
          <PricingPanel
            isOpen={showPricingPanel}
            onClose={() => setShowPricingPanel(false)}
            isSmallScreen={isSmallScreen}
          />
        )}
      </AnimatePresence>
      {/* Mobile tooltips for desktop header buttons */}
      <Tooltip 
        anchorSelect="button[data-tooltip-content='Disable Incognito Chat'], button[data-tooltip-content='Enable Incognito Chat']" 
        content={isIncognitoMode ? "Disable Incognito Chat" : "Enable Incognito Chat"} 
        isOpen={mobileTooltipTargetId === 'incognito-button'} 
        place="bottom"
        style={{zIndex: 1002}}
      />
      <Tooltip 
        anchorSelect="button[data-tooltip-content='Chat History']" 
        content="Chat History" 
        isOpen={mobileTooltipTargetId === 'history-button'} 
        place="bottom"
        style={{zIndex: 1002}}
      />
      <Tooltip 
        anchorSelect="button[data-tooltip-content='Pricing']" 
        content="Pricing" 
        isOpen={mobileTooltipTargetId === 'pricing-button'} 
        place="bottom"
        style={{zIndex: 1002}}
      />
      <Tooltip 
        anchorSelect="button[data-tooltip-content='Menu']" 
        content="Menu" 
        isOpen={mobileTooltipTargetId === 'menu-button'} 
        place="bottom"
        style={{zIndex: 1002}}
      />
      <Tooltip 
        anchorSelect="button[data-tooltip-content='Login / Sign Up']" 
        content="Login / Sign Up" 
        isOpen={mobileTooltipTargetId === 'login-button'} 
        place="bottom"
        style={{zIndex: 1002}}
      />
    </>
  );
};

export default Header; 