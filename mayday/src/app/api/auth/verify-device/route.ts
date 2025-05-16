import { NextResponse } from 'next/server';
import { getAccounts } from '@/utils/server-auth';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { fingerprint, email } = body;

    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email?.toLowerCase();

    console.log('Verify device request:', { email: normalizedEmail, fingerprintProvided: !!fingerprint });

    // Basic validation
    if (!fingerprint || !normalizedEmail) {
      return NextResponse.json(
        { success: false, message: 'Fingerprint and email are required' },
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

    // Check if the device fingerprint matches
    const fingerprintMatches = account.deviceFingerprint === fingerprint;
    
    return NextResponse.json(
      { 
        success: fingerprintMatches, 
        message: fingerprintMatches ? 'Device verified' : 'Device not recognized' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Device verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Device verification failed' },
      { status: 500 }
    );
  }
} 