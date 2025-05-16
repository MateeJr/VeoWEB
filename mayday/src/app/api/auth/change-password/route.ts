import { NextResponse } from 'next/server';
import { getAccounts, saveAccounts } from '@/utils/server-auth';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, currentPassword, newPassword } = body;

    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email?.toLowerCase();

    console.log('Password change request:', { email: normalizedEmail });

    // Basic validation
    if (!normalizedEmail || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Email, current password, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get accounts
    const accounts = getAccounts();

    // Find the account (case-insensitive comparison)
    const accountIndex = accounts.findIndex(acc => acc.email.toLowerCase() === normalizedEmail);
    if (accountIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Account not found' },
        { status: 404 }
      );
    }

    const account = accounts[accountIndex];
    
    // Verify current password
    if (account.password !== currentPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update password
    account.password = newPassword;
    saveAccounts(accounts);

    return NextResponse.json(
      { success: true, message: 'Password has been changed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, message: 'Password change failed. Please try again later.' },
      { status: 500 }
    );
  }
} 