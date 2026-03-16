'use client';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  role: string;
  restaurantIds: string[];
  permissions: string[];
  name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials?: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  hasRestaurantAccess: (restaurantId: string) => boolean;
  loading: boolean;
  error: string | null;
}

// ─── Authentication API ────────────────────────────────────────────────────
const ADAAUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.adasystems.app';
const CLIENT_ID = process.env.NEXT_PUBLIC_ADAAUTH_CLIENT_ID || 'adakds';
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`;

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('adakds_token');
      const storedUser = localStorage.getItem('adakds_user');
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
        } catch {
          this.clearStorage();
        }
      }
    }
  }

  // OAuth-style redirect login
  async login(credentials?: LoginCredentials): Promise<{ user: User; token: string }> {
    if (typeof window === 'undefined') {
      throw new Error('Login is only available in browser environment');
    }

    // For OAuth flow, redirect to Ada Auth
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'read:user read:restaurants',
      state: this.generateState()
    });

    // Store current location for redirect after auth
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem('adakds_redirect_after_auth', currentPath);
    localStorage.setItem('adakds_auth_state', params.get('state')!);

    // Redirect to Ada Auth
    window.location.href = `${ADAAUTH_BASE_URL}/oauth/authorize?${params.toString()}`;
    
    // This promise never resolves since we're redirecting
    return new Promise(() => {});
  }

  // Handle OAuth callback
  async handleCallback(code: string, state: string): Promise<{ user: User; token: string }> {
    // Verify state parameter
    const storedState = localStorage.getItem('adakds_auth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    localStorage.removeItem('adakds_auth_state');

    try {
      // Exchange code for token
      const response = await fetch(`${ADAAUTH_BASE_URL}/api/v2/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          code: code,
          redirect_uri: REDIRECT_URI
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Token exchange failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('Invalid response from authentication server');
      }

      // Get user info with the token
      const userResponse = await fetch(`${ADAAUTH_BASE_URL}/api/v2/user/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user information');
      }

      const userData = await userResponse.json();

      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role || 'staff',
        restaurantIds: userData.restaurant_ids || [],
        permissions: userData.permissions || [],
        name: userData.name || userData.full_name
      };

      // Store in memory and localStorage
      this.token = data.access_token;
      this.user = user;
      this.saveToStorage();

      return { user, token: data.access_token };
    } catch (error) {
      console.error('[AUTH] OAuth callback failed:', error);
      throw error instanceof Error ? error : new Error('Authentication failed');
    }
  }

  async validateToken(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${ADAAUTH_BASE_URL}/api/v2/user/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        this.clearAuth();
        return null;
      }

      const userData = await response.json();

      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role || 'staff',
        restaurantIds: userData.restaurant_ids || [],
        permissions: userData.permissions || [],
        name: userData.name || userData.full_name
      };

      this.user = user;
      this.saveToStorage();

      return user;
    } catch (error) {
      console.error('[AUTH] Token validation failed:', error);
      this.clearAuth();
      return null;
    }
  }

  logout(): void {
    this.clearAuth();
    
    // Optionally redirect to Ada Auth logout
    if (typeof window !== 'undefined') {
      const logoutUrl = `${ADAAUTH_BASE_URL}/logout?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin)}`;
      window.location.href = logoutUrl;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!(this.token && this.user);
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
    return this.user.restaurantIds.includes(restaurantId);
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    if (this.token) {
      localStorage.setItem('adakds_token', this.token);
    }
    
    if (this.user) {
      localStorage.setItem('adakds_user', JSON.stringify(this.user));
    }
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('adakds_token');
    localStorage.removeItem('adakds_user');
    localStorage.removeItem('adakds_redirect_after_auth');
    localStorage.removeItem('adakds_auth_state');
  }

  private clearAuth(): void {
    this.token = null;
    this.user = null;
    this.clearStorage();
  }
}

// Export singleton instance
export const authService = new AuthService();

// ─── API Helper ────────────────────────────────────────────────────────────
export async function apiRequest<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = authService.getToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    // Token expired or invalid
    authService.logout();
    throw new Error('Authentication expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}