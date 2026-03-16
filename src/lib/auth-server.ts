import { cookies } from 'next/headers';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ServerUser {
  id: string;
  email: string;
  role: string;
  restaurant_ids: string[];
  permissions: string[];
  name?: string;
  full_name?: string;
}

// ─── Server-Side Authentication ────────────────────────────────────────────
export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ada_access_token')?.value;
    
    if (!token) {
      return null;
    }

    const res = await fetch('https://auth.adasystems.app/auth/validate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ access_token: token }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`[AUTH] Server validation failed: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.valid ? data.user : null;
  } catch (error) {
    console.error('[AUTH] Server validation error:', error);
    return null;
  }
}

export async function getServerToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('ada_access_token')?.value || null;
  } catch {
    return null;
  }
}

export async function isServerAuthenticated(): Promise<boolean> {
  const user = await getServerUser();
  return user !== null;
}

export async function hasServerRole(requiredRoles: string[]): Promise<boolean> {
  const user = await getServerUser();
  if (!user) return false;
  
  const userRole = user.role.toLowerCase();
  const normalizedRoles = requiredRoles.map(role => role.toLowerCase());
  
  // Super admin has all access
  if (userRole === 'super_admin') return true;
  
  return normalizedRoles.includes(userRole);
}

export async function hasServerRestaurantAccess(restaurantId: string): Promise<boolean> {
  const user = await getServerUser();
  if (!user) return false;
  
  // Super admin has access to all restaurants
  if (user.role === 'super_admin') return true;
  
  // Check if user has access to this specific restaurant
  return user.restaurant_ids.includes(restaurantId);
}