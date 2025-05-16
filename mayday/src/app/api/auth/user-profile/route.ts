import { NextResponse } from 'next/server';
import { getAccounts, saveAccounts } from '@/utils/server-auth';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email } = body;

    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email?.toLowerCase();

    console.log('User profile request:', { email: normalizedEmail });

    // Basic validation
    if (!normalizedEmail) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
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
    
    // Add createdAt timestamp for older accounts that don't have it
    if (!account.createdAt) {
      // Set to current time if missing
      account.createdAt = Date.now();
      saveAccounts(accounts);
    }

    // Return user profile data without password
    const { password, ...userProfile } = account;
    
    return NextResponse.json(
      { 
        success: true,
        user: userProfile
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('User profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 