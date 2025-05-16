// Define types for user
export interface User {
  email: string;
  username?: string;
  password?: string;
  deviceFingerprint?: string;
  createdAt?: number;
  passwordResetOTP?: {
    code: string;
    expiresAt: number;
  };
}

import { generateDeviceFingerprint, matchesDeviceFingerprint } from './deviceFingerprint';

// Client-side function to register a new user
export const registerUser = async (email: string, password: string, username: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint();
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, username, deviceFingerprint }),
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned ${response.status}: Non-JSON response`);
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Registration failed. Please try again.' };
  }
};

// Client-side function to login
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint();
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, deviceFingerprint }),
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned ${response.status}: Non-JSON response`);
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Login failed. Please try again.' };
  }
};

// Client-side function to check device fingerprint and login status
export const verifyDeviceAndLoginStatus = async (): Promise<boolean> => {
  if (typeof document === 'undefined') return false;
  
  try {
    // Check if user is marked as logged in
    if (!document.cookie.includes('isLoggedIn=true')) return false;
    
    // Get the current device fingerprint
    const currentFingerprint = generateDeviceFingerprint();
    
    // Verify with the server that the device is allowed
    const response = await fetch('/api/auth/verify-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        fingerprint: currentFingerprint, 
        email: getLoggedInUserEmail() 
      }),
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Device verification error:', error);
    return false;
  }
};

// Client-side function to check if user is logged in
export const isUserLoggedIn = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('isLoggedIn=true');
};

// Client-side function to get logged in user email
export const getLoggedInUserEmail = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'userEmail') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Client-side function to get logged in username
export const getLoggedInUsername = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'username') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Client-side function to logout
export const logoutUser = (): void => {
  if (typeof document === 'undefined') return;
  
  document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.reload();
};

// Client-side function to get current user profile from account.json
export const getCurrentUserProfile = async (): Promise<{ 
  success: boolean; 
  user?: { 
    email: string; 
    username?: string; 
    deviceFingerprint?: string;
  }; 
  message?: string;
}> => {
  try {
    const email = getLoggedInUserEmail();
    if (!email) {
      return { success: false, message: 'Not logged in' };
    }

    const response = await fetch('/api/auth/user-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user profile');
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned ${response.status}: Non-JSON response`);
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch user profile' 
    };
  }
};

// Client-side function to request password reset
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned ${response.status}: Non-JSON response`);
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Password reset request failed. Please try again.' };
  }
};

// Client-side function to verify OTP and reset password
export const resetPasswordWithOTP = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned ${response.status}: Non-JSON response`);
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Password reset failed. Please try again.' };
  }
};

// Client-side function to change password when logged in
export const changePassword = async (email: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, currentPassword, newPassword }),
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned ${response.status}: Non-JSON response`);
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Password change error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Password change failed. Please try again.' };
  }
}; 