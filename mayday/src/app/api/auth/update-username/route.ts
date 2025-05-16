import { NextResponse } from 'next/server';
import { getAccounts, saveAccounts } from '@/utils/server-auth';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, username } = body;

    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email?.toLowerCase();

    console.log('Update username request:', { email: normalizedEmail, username });

    // Basic validation
    if (!normalizedEmail || !username) {
      return NextResponse.json(
        { success: false, message: 'Email and username are required' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Get accounts
    const accounts = getAccounts();

    // Find the account (case-insensitive comparison)
    const account = accounts.find(acc => acc.email.toLowerCase() === normalizedEmail);
    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    // Update username
    account.username = username;
    saveAccounts(accounts);
    
    // Set cookies to reflect the change
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Username updated successfully'
      },
      { status: 200 }
    );
    
    // Update the username cookie to match
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    
    response.cookies.set({
      name: 'username',
      value: username,
      expires,
      path: '/',
      httpOnly: false
    });

    return response;
  } catch (error) {
    console.error('Username update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update username' },
      { status: 500 }
    );
  }
} 