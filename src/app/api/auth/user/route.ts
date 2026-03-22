import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ada_access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate token with AdaAuth
    const response = await fetch('https://auth.adasystems.app/auth/validate', {
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

    console.log(`[AUTH] Validating token with AdaAuth: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`[AUTH] AdaAuth response: ${responseText}`);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[AUTH] Failed to parse AdaAuth response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from auth service' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      // Clear invalid cookie
      cookieStore.delete('ada_access_token');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!data.valid) {
      // Clear invalid cookie
      cookieStore.delete('ada_access_token');
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    // Extract restaurant info from restaurant_access array
    const activeAccess = (data.restaurant_access || [])
      .filter((ra: any) => ra.active !== false);

    const restaurantIds = activeAccess.map((ra: any) => ra.restaurant_id);
    const restaurants = activeAccess.map((ra: any) => ({
      id: ra.restaurant_id,
      name: ra.restaurant?.name || ra.restaurant_id,
    }));

    return NextResponse.json({
      user: {
        ...data.user,
        restaurant_ids: restaurantIds,
        restaurants,
      }
    });
  } catch (error) {
    console.error('[AUTH] Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}