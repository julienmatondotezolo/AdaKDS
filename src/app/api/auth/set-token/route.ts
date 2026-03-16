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
      console.log('[AUTH] Validating token before setting cookie...');
      const validateResponse = await fetch('https://auth.adasystems.app/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Slug': 'ada-kds'
        },
        body: JSON.stringify({
          access_token: token,
          app_slug: 'ada-kds'
        }),
      });

      console.log(`[AUTH] AdaAuth validation response: ${validateResponse.status}`);
      
      const responseText = await validateResponse.text();
      console.log(`[AUTH] AdaAuth response body: ${responseText}`);

      let validateData;
      try {
        validateData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[AUTH] Failed to parse validation response:', parseError);
        return NextResponse.json(
          { error: 'Invalid auth service response' },
          { status: 500 }
        );
      }

      if (!validateResponse.ok || !validateData.valid) {
        console.error('[AUTH] Token validation failed:', validateData);
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      
      console.log('[AUTH] Token validation successful');
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