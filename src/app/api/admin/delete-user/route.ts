import { NextRequest, NextResponse } from 'next/server';
import { deleteUser } from '@/lib/redis';

export async function DELETE(req: NextRequest) {
  try {
    // Get request headers for authorization
    const email = req.headers.get('x-user-email');

    // Only allow admin (vallian476@gmail.com) to access this endpoint
    if (email !== 'vallian476@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get the email of the user to delete from request body
    const body = await req.json();
    const { email: userEmail } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Don't allow deleting the admin account
    if (userEmail === 'vallian476@gmail.com') {
      return NextResponse.json(
        { error: 'Cannot delete admin account' },
        { status: 403 }
      );
    }

    // Delete the user from Redis
    await deleteUser(userEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user for admin:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 