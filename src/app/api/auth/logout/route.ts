import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Clear the authentication cookie
    const cookieStore = await cookies();
    cookieStore.delete('ada_access_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AUTH] Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}