import React from 'react';

// Define types for user
export interface User {
  email: string;
  username?: string;
  password?: string; // Hashed password
  deviceFingerprint?: string;
  createdAt?: number;
  allowLogging?: boolean;  // Add new field for data controls
  allowTelemetry?: boolean; // Add new field for data controls
  passwordResetOTP?: {
    code: string;
    expiresAt: number;
  };
}

import { generateDeviceFingerprint } from './deviceFingerprint'; // Assuming this is in the same utils folder

// --- Start: Helper functions for cookie management (client-side) ---
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const eraseCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
// --- End: Helper functions for cookie management ---


// Client-side function to register a new user
export const registerUser = async (email: string, password: string, username: string): Promise<{ success: boolean; message: string; username?: string }> => {
  try {
    const deviceFingerprint = generateDeviceFingerprint();
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username, deviceFingerprint }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    if (data.success) {
        // Set login cookies directly after successful registration
        setCookie('isLoggedIn', 'true', 7);
        setCookie('userEmail', email, 7);
        if (data.username) {
          setCookie('username', data.username, 7);
        }
    }
    return data;
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Registration failed. Please try again.' };
  }
};

// Client-side function to login
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; message: string; username?: string }> => {
  try {
    const deviceFingerprint = generateDeviceFingerprint();
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceFingerprint }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    
    if (data.success) {
      setCookie('isLoggedIn', 'true', 7);
      setCookie('userEmail', email, 7);
      if (data.username) {
        setCookie('username', data.username, 7);
      }
    }
    return data;
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Login failed. Please try again.' };
  }
};

// Client-side function to check if user is logged in
export const isUserLoggedIn = (): boolean => {
  return getCookie('isLoggedIn') === 'true';
};

// Client-side function to get logged in user email
export const getLoggedInUserEmail = (): string | null => {
  return getCookie('userEmail');
};

// Client-side function to get logged in username
export const getLoggedInUsername = (): string | null => {
  return getCookie('username');
};

// Client-side function to logout
export const logoutUser = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    const email = getLoggedInUserEmail();
    // Optional: Notify backend of logout for session invalidation or logging
    if (email) {
        // This is optional, depends on whether your backend needs a logout call
        // await fetch('/api/auth/logout', { 
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email }),
        // });
    }
  } catch (error) {
      console.error("Error during server-side logout:", error);
      // Decide if this should prevent client-side logout
  } finally {
    eraseCookie('isLoggedIn');
    eraseCookie('userEmail');
    eraseCookie('username');
    // Consider using router.push('/') or similar instead of window.location.reload() for smoother UX in Next.js
    if (typeof window !== 'undefined') {
        window.location.href = '/'; // Or trigger a state update to re-render UI
    }
  }
  return { success: true };
};

// Client-side function to get current user profile
export const getCurrentUserProfile = async (): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const email = getLoggedInUserEmail();
    if (!email) return { success: false, message: 'Not logged in' };

    const response = await fetch('/api/auth/user-profile', {
      method: 'POST', // Using POST to send email in body, could be GET with query param
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch user profile');
    return data; // Expects { success: true, user: UserDetails }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to fetch user profile' };
  }
};

// Client-side function to update username
export const updateUserProfile = async (email: string, username: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/auth/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update username');
      if (data.success) {
          setCookie('username', username, 7); // Update username cookie
      }
      return data;
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to update username. Please try again.' };
    }
};


// Client-side function to request password reset
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Password reset request failed.' };
  }
};

// Client-side function to verify OTP and reset password
export const resetPasswordWithOTP = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Password reset failed.' };
  }
};

// Client-side function to change password when logged in
export const changePassword = async (email: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, currentPassword, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Password change failed.' };
  }
};

// Client-side function to verify device fingerprint
// This is a simplified version. Real verification would involve checking against a stored trusted fingerprint.
export const verifyDevice = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const currentFingerprint = generateDeviceFingerprint();
      // In a real app, you'd send this to the server to compare against stored trusted fingerprints for the user.
      // For this example, we'll assume the server has a way to validate it.
      const response = await fetch('/api/auth/verify-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fingerprint: currentFingerprint }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Device verification failed');
      return data; // Expects { success: true } or { success: false, message: '...' }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Device verification failed.' };
    }
};

// Client-side function to delete user account
export const deleteAccount = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/auth/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      // Prefer message from server response if available
      throw new Error(data.message || 'Failed to delete account. Status: ' + response.status);
    }
    return data; // Expects { success: true, message: '...' } or { success: false, message: '...' }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'An unexpected error occurred while deleting the account.' };
  }
};

// Client-side function to update user settings
export const updateUserSettings = async (email: string, settings: { allowLogging?: boolean; allowTelemetry?: boolean }): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch('/api/auth/update-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...settings }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update settings');
    return data;
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to update settings. Please try again.' };
  }
};

// This function would typically be part of a broader auth context/provider
// to make auth state easily accessible throughout the app.
export const useAuth = () => {
    const [loggedIn, setLoggedIn] = React.useState(isUserLoggedIn());
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const checkAuthStatus = async () => {
            setLoading(true);
            const currentlyLoggedInByCookie = isUserLoggedIn(); // Checks 'isLoggedIn' cookie
            
            if (currentlyLoggedInByCookie) {
                const userEmailFromCookie = getLoggedInUserEmail(); // Gets 'userEmail' cookie

                if (userEmailFromCookie) {
                    // We have an email, let's verify the device
                    const deviceVerification = await verifyDevice(userEmailFromCookie);
                    if (!deviceVerification.success) {
                        console.warn('Device verification failed during auth check. Logging out. Message:', deviceVerification.message);
                        await logoutUser(); // This should clear cookies and update state via reload/re-render
                        setLoggedIn(false); 
                        setUser(null);
                        setLoading(false);
                        return; // Exit: Device not verified
                    }

                    // Device is verified, now get profile
                    const profile = await getCurrentUserProfile(); // getCurrentUserProfile uses its own getLoggedInUserEmail()
                    if (profile.success && profile.user) {
                        setUser(profile.user);
                        setLoggedIn(true); // Confirm loggedIn state
                    } else {
                        console.warn('Failed to get user profile after successful device verification during auth check. Logging out. Message:', profile.message);
                        await logoutUser();
                        setLoggedIn(false);
                        setUser(null);
                    }
                } else {
                    // 'isLoggedIn' cookie was true, but 'userEmail' cookie is missing. This is an inconsistent state.
                    console.warn("'isLoggedIn' cookie present, but 'userEmail' cookie is missing during auth check. Logging out.");
                    await logoutUser();
                    setLoggedIn(false);
                    setUser(null);
                }
            } else {
                // Not logged in (no 'isLoggedIn' cookie)
                setLoggedIn(false);
                setUser(null);
            }
            setLoading(false);
        };
        checkAuthStatus();
        
        // Optional: Listen to storage events if cookies are changed in other tabs
        // window.addEventListener('storage', checkAuthStatus);
        // return () => window.removeEventListener('storage', checkAuthStatus);
    }, []);

    const login = async (email: string, pass: string) => {
        setLoading(true);
        const result = await loginUser(email, pass);
        if (result.success) {
            setLoggedIn(true);
            const profile = await getCurrentUserProfile();
             if (profile.success && profile.user) {
                setUser(profile.user);
            }
        }
        setLoading(false);
        return result;
    };

    const logout = async () => {
        setLoading(true);
        await logoutUser();
        setLoggedIn(false);
        setUser(null);
        setLoading(false);
    };
    
    const register = async (email: string, pass: string, uname: string) => {
        setLoading(true);
        const result = await registerUser(email, pass, uname);
        if (result.success) {
          // User is automatically logged in by registerUser function
          setLoggedIn(true);
          // Get user profile after successful registration and auto-login
          const profile = await getCurrentUserProfile();
          if (profile.success && profile.user) {
            setUser(profile.user);
          }
        }
        setLoading(false);
        return result;
    };


    return { loggedIn, user, loading, login, logout, register, getCurrentUserProfile, updateUserProfile, requestPasswordReset, resetPasswordWithOTP, changePassword, verifyDevice, deleteAccount, updateUserSettings };
};

// You'll need to import React for the useAuth hook if you use it.
// import React from 'react';
// If not using the hook directly in this file, ensure React is available where it's consumed. 