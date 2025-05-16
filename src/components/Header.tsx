'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LuLock, LuMenu, LuUser, LuHistory, LuChevronDown, LuMessageSquare } from 'react-icons/lu';
import { Tooltip } from 'react-tooltip';
import { useAuth, User } from '../utils/auth';
import LoginModal from './LoginModal';
import AccountModal from './AccountModal';

const Header = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, loggedIn, loading, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

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
    color: '#333',
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
      setShowAccountModal(false);
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

  const handleAccountButtonClick = () => {
    if (isSmallScreen) {
      setIsDropdownOpen(prev => !prev);
    } else {
      if (loggedIn) {
        setShowAccountModal(true);
      } else {
        setShowLoginModal(true);
      }
    }
  };

  const dropdownItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    color: '#333',
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
    color: '#555',
    marginRight: '12px',
  };

  const handleDropdownItemMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    e.currentTarget.style.transform = 'scale(0.98)';
  };

  const handleDropdownItemMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isHovering = e.currentTarget.matches(':hover');
    e.currentTarget.style.backgroundColor = isHovering ? '#f0f0f0' : 'transparent';
    e.currentTarget.style.transform = 'scale(1)';
  };

  const onDropdownItemClick = (action: string) => {
    console.log(`${action} clicked`);
    setIsDropdownOpen(false);
    if (action === 'account') {
        if (loggedIn) {
            setShowAccountModal(true);
        } else {
            setShowLoginModal(true);
        }
    }
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '72px',
          background: 'linear-gradient(to bottom, #f7faff 80%, rgba(247, 250, 255, 0))',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            LOGO
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          {loading ? 'Loading...' : 'STATUS HERE'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          {isSmallScreen ? (
            <button
              ref={accountButtonRef}
              style={{ ...iconButtonStyle, flexDirection: 'column', padding: '4px' }}
              onClick={handleAccountButtonClick}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <LuUser style={iconStyle} />
              <LuChevronDown style={{ ...iconStyle, fontSize: '14px', marginTop: '0px' }} />
            </button>
          ) : (
            <>
              <button
                style={iconButtonStyle}
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Incognito Chat"
                data-tooltip-place="bottom"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <LuLock style={iconStyle} />
              </button>
              <button
                style={iconButtonStyle}
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Chat History"
                data-tooltip-place="bottom"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <LuHistory style={iconStyle} />
              </button>
              <button
                style={iconButtonStyle}
                data-tooltip-id="header-tooltip"
                data-tooltip-content="Menu"
                data-tooltip-place="bottom"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <LuMenu style={iconStyle} />
              </button>
              <button
                ref={accountButtonRef}
                style={iconButtonStyle}
                data-tooltip-id="header-tooltip"
                data-tooltip-content={loading ? "Account" : (loggedIn ? "Account" : "Login / Sign Up")}
                data-tooltip-place="bottom"
                onClick={handleAccountButtonClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <LuUser style={iconStyle} />
              </button>
            </>
          )}
          {isSmallScreen && isDropdownOpen && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1001,
                width: '220px',
                overflow: 'hidden',
              }}
            >
              <button
                style={{...dropdownItemStyle, borderBottom: '1px solid #eee'}}
                onMouseDown={handleDropdownItemMouseDown}
                onMouseUp={handleDropdownItemMouseUp}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)';}}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0';}}
                onClick={() => onDropdownItemClick('account')}
              >
                <LuUser style={dropdownListItemIconStyle} />
                {loading ? "Account" : (loggedIn ? 'Account' : 'Login / Sign Up')}
              </button>
              <button
                style={{...dropdownItemStyle, borderBottom: '1px solid #eee'}}
                onMouseDown={handleDropdownItemMouseDown}
                onMouseUp={handleDropdownItemMouseUp}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)';}}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0';}}
                onClick={() => onDropdownItemClick('incognito_chat_small')}
              >
                <LuLock style={dropdownListItemIconStyle} />
                Incognito Chat
              </button>
              <button
                style={{...dropdownItemStyle, borderBottom: '1px solid #eee'}}
                onMouseDown={handleDropdownItemMouseDown}
                onMouseUp={handleDropdownItemMouseUp}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)';}}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0';}}
                onClick={() => onDropdownItemClick('history_small')}
              >
                <LuHistory style={dropdownListItemIconStyle} />
                Chat History
              </button>
              <button
                style={dropdownItemStyle}
                onMouseDown={handleDropdownItemMouseDown}
                onMouseUp={handleDropdownItemMouseUp}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)';}}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0';}}
                onClick={() => onDropdownItemClick('feedback_small')}
              >
                <LuMessageSquare style={dropdownListItemIconStyle} />
                Feedback
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
        />
      </header>
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
      {showAccountModal && user && (
        <AccountModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          userEmail={user.email}
        />
      )}
    </>
  );
};

export default Header; 