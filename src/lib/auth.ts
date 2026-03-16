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
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  hasRestaurantAccess: (restaurantId: string) => boolean;
  loading: boolean;
  error: string | null;
}

// ─── Authentication API ────────────────────────────────────────────────────
const ADAAUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.adasystems.app';

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

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${ADAAUTH_API_URL}/api/v2/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response from authentication server');
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role || 'staff',
        restaurantIds: data.user.restaurantIds || [],
        permissions: data.user.permissions || [],
        name: data.user.name
      };

      // Store in memory and localStorage
      this.token = data.token;
      this.user = user;
      this.saveToStorage();

      return { user, token: data.token };
    } catch (error) {
      console.error('[AUTH] Login failed:', error);
      throw error instanceof Error ? error : new Error('Login failed');
    }
  }

  async validateToken(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${ADAAUTH_API_URL}/api/v2/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ token: this.token })
      });

      if (!response.ok) {
        this.clearAuth();
        return null;
      }

      const data = await response.json();
      
      if (!data.valid || !data.user) {
        this.clearAuth();
        return null;
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role || 'staff',
        restaurantIds: data.user.restaurantIds || [],
        permissions: data.user.permissions || [],
        name: data.user.name
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