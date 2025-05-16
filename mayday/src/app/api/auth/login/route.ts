import { NextResponse } from 'next/server';
import { getAccounts, saveAccounts } from '@/utils/server-auth';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, password, deviceFingerprint } = body;

    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email?.toLowerCase();

    console.log('Login request:', { email: normalizedEmail, fingerprintProvided: !!deviceFingerprint });

    // Basic validation
    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
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

    // Check if account exists and password matches (case-insensitive email comparison)
    const account = accounts.find(account => account.email.toLowerCase() === normalizedEmail);
    if (!account || account.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update the device fingerprint for the account
    account.deviceFingerprint = deviceFingerprint;
    saveAccounts(accounts);
    
    // Set cookies
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
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
      value: account.email, // Use the original stored email format
      expires,
      path: '/',
      httpOnly: false
    });
    
    // Set username cookie if available
    if (account.username) {
      response.cookies.set({
        name: 'username',
        value: account.username,
        expires,
        path: '/',
        httpOnly: false
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed. Please check server logs.' },
      { status: 500 }
    );
  }
} 