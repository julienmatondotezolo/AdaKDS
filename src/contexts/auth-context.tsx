'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type AuthContextType, type User } from '@/lib/auth';

// ─── Context Definition ──────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider Component ────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Initialize Authentication ─────────────────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user from cookie-based session
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('[AUTH] Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication initialization failed');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ─── Logout Function ───────────────────────────────────────────────────────
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('[AUTH] Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  // ─── Helper Functions ──────────────────────────────────────────────────────
  const isAuthenticated = user !== null;

  const isAdmin = user ? authService.isAdmin() : false;

  const isOwner = user ? authService.isOwner() : false;

  const hasRestaurantAccess = (restaurantId: string): boolean => {
    return authService.hasRestaurantAccess(restaurantId);
  };

  // ─── Context Value ─────────────────────────────────────────────────────────
  const contextValue: AuthContextType = {
    user,
    logout,
    isAuthenticated,
    isAdmin,
    isOwner,
    hasRestaurantAccess,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Custom Hook ───────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ─── Route Protection Components ───────────────────────────────────────────
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
  requireOwner?: boolean;
  restaurantId?: string;
}

export function ProtectedRoute({ 
  children, 
  fallback, 
  requireAdmin = false,
  requireOwner = false,
  restaurantId 
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isOwner, hasRestaurantAccess, loading } = useAuth();

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2 text-gray-600">Authenticating...</span>
      </div>
    );
  }

  // Check authentication - middleware should handle redirects
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2 text-gray-600">Redirecting to login...</span>
      </div>
    );
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return fallback || <AccessDenied requiredRole="Admin" />;
  }

  // Check owner requirement
  if (requireOwner && !isOwner) {
    return fallback || <AccessDenied requiredRole="Owner" />;
  }

  // Check restaurant access
  if (restaurantId && !hasRestaurantAccess(restaurantId)) {
    return fallback || <AccessDenied reason={`restaurant ${restaurantId}`} />;
  }

  return <>{children}</>;
}

// ─── Fallback Components ───────────────────────────────────────────────────
interface AccessDeniedProps {
  requiredRole?: string;
  reason?: string;
}

function AccessDenied({ requiredRole, reason }: AccessDeniedProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            {requiredRole 
              ? `This page requires ${requiredRole} access.`
              : reason
              ? `You don&apos;t have access to ${reason}.`
              : 'You don&apos;t have permission to access this page.'
            }
          </p>
          {user && (
            <p className="mt-2 text-sm text-gray-500">
              Currently logged in as: {user.email} ({user.role})
            </p>
          )}
        </div>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Go Back
          </button>
          <button
            onClick={logout}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}