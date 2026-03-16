import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('ada_access_token')?.value;

  // No token → redirect to AdaAuth login
  if (!token) {
    const callback = `${request.nextUrl.origin}/auth/callback`;
    return NextResponse.redirect(
      `https://auth.adasystems.app/?redirect=${encodeURIComponent(callback)}`
    );
  }

  // Token exists → validate it's still valid
  try {
    const res = await fetch('https://auth.adasystems.app/auth/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token }),
    });
    
    const data = await res.json();
    
    if (!data.valid) {
      // Expired/invalid → clear cookie + redirect to login
      const callback = `${request.nextUrl.origin}/auth/callback`;
      const response = NextResponse.redirect(
        `https://auth.adasystems.app/?redirect=${encodeURIComponent(callback)}`
      );
      response.cookies.delete('ada_access_token');
      return response;
    }
  } catch {
    // AdaAuth unreachable → let through (don't lock users out)
    console.warn('[AUTH] AdaAuth validation failed, allowing request through');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (callback route itself)
     * - manifest.json, sw.js (PWA files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth/callback|manifest.json|sw.js).*)',
  ],
};