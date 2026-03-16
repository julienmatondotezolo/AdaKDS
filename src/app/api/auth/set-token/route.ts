import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Validate the token with AdaAuth before storing
    try {
      const validateResponse = await fetch('https://auth.adasystems.app/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Service-Slug': 'ada-kds'
        },
        body: JSON.stringify({ 
          access_token: token,
          service: 'ada-kds'
        }),
      });

      const validateData = await validateResponse.json();

      if (!validateData.valid) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    } catch (validateError) {
      console.error('[AUTH] Token validation failed:', validateError);
      return NextResponse.json(
        { error: 'Token validation failed' },
        { status: 401 }
      );
    }

    // Set the token as httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('ada_access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AUTH] Set token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}