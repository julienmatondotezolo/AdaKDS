'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Settings, Users, BarChart3, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  restaurant_id: string;
  role: 'admin' | 'owner' | 'staff';
  full_name?: string;
  is_active: boolean;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // For development, simulate admin check
      const mockUser: User = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@losteria.com',
        restaurant_id: 'c1cbea71-ece5-4d63-bb12-fe06b03d1140',
        role: 'admin',
        full_name: 'Admin User',
        is_active: true
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user has admin or owner role
      if (!['admin', 'owner'].includes(mockUser.role)) {
        router.push('/');
        return;
      }

      setUser(mockUser);
    } catch (err) {
      setError('Failed to verify admin access');
      console.error('Admin access check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            This area is restricted to administrators and owners only.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const navigationItems = [
    {
      href: '/admin/stations',
      icon: Settings,
      label: 'Station Management',
      description: 'Configure kitchen stations',
      roles: ['admin', 'owner']
    },
    {
      href: '/admin/users',
      icon: Users,
      label: 'User Management',
      description: 'Manage restaurant staff',
      roles: ['admin']
    },
    {
      href: '/admin/analytics',
      icon: BarChart3,
      label: 'Analytics',
      description: 'Performance insights',
      roles: ['admin', 'owner']
    }
  ];

  const allowedItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Restaurant Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.full_name || user.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Back to KDS
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Navigation</h2>
              <nav className="space-y-2">
                {allowedItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <item.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>

              {/* Role Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    user.role === 'admin' ? 'bg-red-500' : 
                    user.role === 'owner' ? 'bg-orange-500' : 
                    'bg-green-500'
                  }`} />
                  <span className="text-xs text-gray-600 uppercase tracking-wide">
                    {user.role} Access
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}