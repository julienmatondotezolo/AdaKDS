'use client';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface RestaurantInfo {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  restaurant_ids: string[];
  restaurants: RestaurantInfo[];
  permissions: string[];
  name?: string;
  full_name?: string;
}

export interface AuthContextType {
  user: User | null;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  hasRestaurantAccess: (restaurantId: string) => boolean;
  loading: boolean;
  error: string | null;
}

// ─── Authentication Service (Cookie-based) ─────────────────────────────────
class AuthService {
  private user: User | null = null;

  async getCurrentUser(): Promise<User | null> {
    try {
      // Get user info from cookie-based session
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const userData = await response.json();
      this.user = userData.user;
      return this.user;
    } catch (error) {
      console.error('[AUTH] Failed to get current user:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      this.user = null;
      
      // Redirect to Ada Auth
      if (typeof window !== 'undefined') {
        const callback = `${window.location.origin}/auth/callback`;
        window.location.href = `https://auth.adasystems.app/?redirect=${encodeURIComponent(callback)}`;
      }
    } catch (error) {
      console.error('[AUTH] Logout failed:', error);
    }
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  isAdmin(): boolean {
    if (!this.user) return false;
    const adminRoles = ['admin', 'owner', 'super_admin'];
    return adminRoles.includes(this.user.role.toLowerCase());
  }

  isOwner(): boolean {
    if (!this.user) return false;
    const ownerRoles = ['owner', 'super_admin'];
    return ownerRoles.includes(this.user.role.toLowerCase());
  }

  hasRestaurantAccess(restaurantId: string): boolean {
    if (!this.user) return false;
    
    // Super admin has access to all restaurants
    if (this.user.role === 'super_admin') return true;
    
    // Check if user has access to this specific restaurant
    return this.user.restaurant_ids.includes(restaurantId);
  }
}

// Export singleton instance
export const authService = new AuthService();

// ─── API Helper ────────────────────────────────────────────────────────────
export async function apiRequest<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    ...options,
    credentials: 'include', // Include cookies in requests
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    // Token expired or invalid - redirect to Ada Auth
    if (typeof window !== 'undefined') {
      const callback = `${window.location.origin}/auth/callback`;
      window.location.href = `https://auth.adasystems.app/?redirect=${encodeURIComponent(callback)}`;
    }
    throw new Error('Authentication expired. Redirecting to login...');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}