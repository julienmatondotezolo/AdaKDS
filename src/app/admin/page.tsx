'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Settings, Database, ChefHat, Menu, Users } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, isOwner } = useAuth();

  const adminModules = [
    {
      title: 'Station Management',
      description: 'Manage kitchen stations, assign orders, and configure workflows',
      icon: <ChefHat className="w-8 h-8" />,
      href: '/admin/stations',
      color: 'bg-blue-500',
      available: isAdmin || isOwner,
    },
    {
      title: 'Menu Assignment',
      description: 'Assign menu items to kitchen stations for efficient order routing',
      icon: <Menu className="w-8 h-8" />,
      href: '/menu-assignments',
      color: 'bg-green-500',
      available: isAdmin || isOwner,
    },
    {
      title: 'API Documentation',
      description: 'View API documentation and test endpoints',
      icon: <Database className="w-8 h-8" />,
      href: 'https://api-kds.adasystems.app/api-docs',
      color: 'bg-purple-500',
      available: isAdmin,
      external: true,
    },
    {
      title: 'User Management',
      description: 'Manage user roles and restaurant access (Coming Soon)',
      icon: <Users className="w-8 h-8" />,
      href: '#',
      color: 'bg-orange-500',
      available: isAdmin,
      comingSoon: true,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}. Manage your restaurant&apos;s kitchen display system.
        </p>
      </div>

      {/* Role Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'} Access
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChefHat className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Stations</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Menu Items</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminModules
          .filter(module => module.available)
          .map((module, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start">
                  <div className={`p-3 rounded-lg text-white ${module.color} ${module.comingSoon ? 'opacity-50' : ''}`}>
                    {module.icon}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {module.title}
                      {module.comingSoon && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600 mb-4">{module.description}</p>
                    
                    {!module.comingSoon && (
                      <button
                        onClick={() => {
                          if (module.external) {
                            window.open(module.href, '_blank');
                          } else {
                            router.push(module.href);
                          }
                        }}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {module.external ? 'Open Documentation' : 'Open Module'}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Kitchen Display
          </button>
          <button
            onClick={() => window.open('https://api-kds.adasystems.app/api-docs', '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View API Docs
          </button>
          <button
            onClick={() => router.push('/admin/stations')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Manage Stations
          </button>
        </div>
      </div>
    </div>
  );
}