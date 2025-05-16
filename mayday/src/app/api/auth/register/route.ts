import { NextResponse } from 'next/server';
import { getAccounts, saveAccounts } from '@/utils/server-auth';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, password, username, deviceFingerprint } = body;

    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email?.toLowerCase();

    console.log('Register request:', { email: normalizedEmail, username, fingerprintProvided: !!deviceFingerprint });

    // Basic validation
    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Username is required' },
        { status: 400 }
      );
    }

    if (!deviceFingerprint) {
      return NextResponse.json(
        { success: false, message: 'Device information is required' },
        { status: 400 }
      );
    }

    // Get existing accounts
    const accounts = getAccounts();

    // Check if account already exists (case-insensitive comparison)
    if (accounts.some(account => account.email.toLowerCase() === normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Account already exists' },
        { status: 400 }
      );
    }

    // Current timestamp for account creation
    const createdAt = Date.now();

    // Add new account with device fingerprint and creation timestamp
    accounts.push({ 
      email, 
      password, 
      username, 
      deviceFingerprint,
      createdAt 
    });
    saveAccounts(accounts);

    // Set cookies
    const response = NextResponse.json(
      { success: true, message: 'Registration successful' },
      { status: 201 }
    );

    // Set cookies for 7 days
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    
    response.cookies.set({
      name: 'isLoggedIn',
      value: 'true',
      expires,
      path: '/',
      httpOnly: false
    });
    
    response.cookies.set({
      name: 'userEmail',
      value: email, // Use the original email format
      expires,
      path: '/',
      httpOnly: false
    });
    
    response.cookies.set({
      name: 'username',
      value: username,
      expires,
      path: '/',
      httpOnly: false
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed. Please check server logs.' },
      { status: 500 }
    );
  }
} 