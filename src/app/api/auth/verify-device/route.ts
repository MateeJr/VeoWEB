import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { User } from '@/utils/auth';

const usersFilePath = path.join(process.cwd(), 'users.json');

async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    console.error("Error reading users file:", error);
    throw new Error('Could not read user data');
  }
}

// Note: saveUsers function might not be needed if we don't update fingerprint here,
// or only update it during login for simplicity in this example.
async function saveUsers(users: User[]): Promise<void> {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing users file:", error);
    throw new Error('Could not save user data');
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBodyText = await req.text();
    console.log('[VERIFY_DEVICE_POST] Raw request body text:', rawBodyText);

    if (!rawBodyText) {
      console.error('[VERIFY_DEVICE_POST] Request body is empty.');
      return NextResponse.json({ success: false, message: 'Request body is empty' }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(rawBodyText);
    } catch (parseError) {
      console.error('[VERIFY_DEVICE_POST] JSON.parse error:', parseError);
      console.error('[VERIFY_DEVICE_POST] Raw body that failed to parse:', rawBodyText);
      return NextResponse.json({ success: false, message: 'Invalid JSON format in request body' }, { status: 400 });
    }
    
    const { email, fingerprint } = body;

    if (!email || !fingerprint) {
      return NextResponse.json({ success: false, message: 'Email and fingerprint are required' }, { status: 400 });
    }

    const users = await getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      // Important: Do not reveal if the email exists or not for security reasons
      return NextResponse.json({ success: false, message: 'Device verification failed (user not found)' }, { status: 403 });
    }

    // This is a simplified verification. 
    // A real app might:
    // 1. Check against a list of trusted device fingerprints for the user.
    // 2. If it's a new device, trigger a 2FA or email verification step.
    // 3. For this example, we'll consider it verified if the user has a fingerprint and it matches,
    //    or if the user *doesn't* have a fingerprint stored yet (first login from a device that captures it).
    //    The login route already handles setting the initial fingerprint.

    if (user.deviceFingerprint && user.deviceFingerprint === fingerprint) {
      return NextResponse.json({ success: true, message: 'Device verified' });
    } else if (!user.deviceFingerprint) {
        // This case implies that the login process should have set a fingerprint.
        // If called directly and user has no fingerprint, it could be a first-time setup scenario
        // or an attempt to bypass fingerprinting. For this example, we'll treat it as needing login
        // to establish the fingerprint.
        // console.warn(`Verify device called for user ${email} with no stored fingerprint. Login should establish one.`);
        // Potentially, you could register this new fingerprint here after some verification step.
        // For now, let's assume login handles the primary fingerprint registration.
        // If we want to be strict, this should be a failure or trigger 2FA.
        // Let's return false if it's not explicitly matching a stored one.
        return NextResponse.json({ success: false, message: 'Device not recognized. Please login to register this device.' }, { status: 403 });
    } else {
      // Fingerprint exists but does not match
      // console.warn(`Device fingerprint mismatch for user ${email}. Stored: ${user.deviceFingerprint}, Current: ${fingerprint}`);
      return NextResponse.json({ success: false, message: 'Device verification failed. Untrusted device.' }, { status: 403 });
    }

  } catch (error) {
    console.error('[VERIFY_DEVICE_POST] General error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 