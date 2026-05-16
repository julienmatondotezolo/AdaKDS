import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('ada_access_token')?.value;

  // Use production URL for callback in production, fallback to request origin for development
  const getCallbackUrl = () => {
    const host = request.headers.get('host');
    
    // Force production URL when deployed on adasystems.app domain
    if (host?.includes('adasystems.app') || host?.includes('kds.adasystems.app')) {
      return 'https://kds.adasystems.app/auth/callback';
    }
    
    // Check environment variables
    const prodUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
    if (prodUrl) {
      const baseUrl = prodUrl.startsWith('http') ? prodUrl : `https://${prodUrl}`;
      return `${baseUrl}/auth/callback`;
    }
    
    // Development fallback
    return `${request.nextUrl.origin}/auth/callback`;
  };

  // No token → redirect to AdaAuth login
  if (!token) {
    const callback = getCallbackUrl();
    return NextResponse.redirect(
      `https://auth.adasystems.app/?redirect=${encodeURIComponent(callback)}`
    );
  }

  // Token exists → validate it's still valid
  try {
    const res = await fetch('https://auth.adasystems.app/auth/validate', {
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
    
    const data = await res.json();
    
    if (!data.valid) {
      // Expired/invalid → clear cookie + redirect to login
      const callback = getCallbackUrl();
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
     * - auth/callback (callback route itself)
     * - manifest.json, sw.js (PWA files)
     * - root-level static assets needed unauthenticated for PWA install:
     *   favicons, apple-touch-icon, icon-*, apple-splash-* — must respond 200
     *   to iOS / Android installer or the home-screen icon falls back to a
     *   page screenshot.
     */
    '/((?!api|_next/static|_next/image|auth/callback|manifest\\.json|sw\\.js|favicon\\.ico|favicon\\.png|favicon-[^/]+\\.png|apple-touch-icon[^/]*\\.png|apple-splash-[^/]+\\.png|icon-[^/]+\\.png).*)',
  ],
};