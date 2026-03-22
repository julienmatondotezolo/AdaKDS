'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute, useAuth } from '@/contexts/auth-context';
import { useRestaurant } from '@/contexts/restaurant-context';
import { RestaurantSelector } from '@/components/kds/restaurant-selector';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Button, Input, Badge,
} from 'ada-design-system';
import {
  ArrowLeft, Plus, Edit3, Trash2, Save, X,
  ChevronUp, ChevronDown, User, LogOut, ChefHat, Utensils,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import Link from 'next/link';

// ─── Types ──────────────────────────────────────────────────────────────
interface Station {
  id: string;
  restaurant_id: string;
  name: string;
  code: string;
  color: string;
  display_order: number;
  active: boolean;
  categories: string[];
  created_at: string;
}

interface StationFormData {
  name: string;
  code: string;
  color: string;
  categories: string[];
  active: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────
const AVAILABLE_CATEGORIES = [
  'pizza', 'pasta', 'meat', 'fish', 'salad', 'appetizer', 'dessert',
  'grill', 'drinks', 'wine', 'cocktails', 'hot', 'cold', 'sides',
  'soup', 'bread', 'seafood', 'vegetarian', 'vegan',
];

const DEFAULT_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1',
];

type Tab = 'profile' | 'stations';

// ─── Settings Page ──────────────────────────────────────────────────────
function SettingsContent() {
  const { user, logout } = useAuth();
  const { restaurantId, restaurantName, needsSelection } = useRestaurant();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  if (needsSelection) return <RestaurantSelector />;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'stations', label: 'Stations', icon: <ChefHat className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
              {restaurantName && (
                <p className="text-sm text-gray-500 -mt-0.5">{restaurantName}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {activeTab === 'profile' && <ProfileTab user={user} logout={logout} restaurantName={restaurantName} />}
        {activeTab === 'stations' && restaurantId && <StationsTab restaurantId={restaurantId} />}
      </div>
    </div>
  );
}

// ─── Profile Tab ────────────────────────────────────────────────────────
function ProfileTab({
  user,
  logout,
  restaurantName,
}: {
  user: any;
  logout: () => void;
  restaurantName: string | null;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Account information from AdaAuth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-semibold">
                {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.full_name || 'User'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
              <Badge className="mt-1 capitalize">{user?.role || 'staff'}</Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Restaurant</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{restaurantName || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button variant="destructive" onClick={logout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Stations Tab ───────────────────────────────────────────────────────
function StationsTab({ restaurantId }: { restaurantId: string }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState<StationFormData>({
    name: '', code: '', color: DEFAULT_COLORS[0], categories: [], active: true,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app';

  const loadStations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest<{ stations: Station[] }>(
        `${API_URL}/api/v1/stations?restaurant_id=${restaurantId}`,
      );
      setStations(data.stations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stations');
    } finally {
      setLoading(false);
    }
  }, [API_URL, restaurantId]);

  useEffect(() => { loadStations(); }, [loadStations]);

  const openCreate = () => {
    setEditingStation(null);
    setFormData({ name: '', code: '', color: DEFAULT_COLORS[0], categories: [], active: true });
    setShowForm(true);
  };

  const openEdit = (s: Station) => {
    setEditingStation(s);
    setFormData({ name: s.name, code: s.code, color: s.color, categories: s.categories, active: s.active });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim() || !formData.code.trim()) throw new Error('Name and code are required');
      const payload = { ...formData, code: formData.code.trim(), name: formData.name.trim(), restaurant_id: restaurantId };
      const url = editingStation ? `${API_URL}/api/v1/stations/${editingStation.id}` : `${API_URL}/api/v1/stations`;
      await apiRequest(url, { method: editingStation ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      await loadStations();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save station');
    }
  };

  const handleDelete = async (s: Station) => {
    if (!confirm(`Delete station "${s.name}"?`)) return;
    try {
      await apiRequest(`${API_URL}/api/v1/stations/${s.id}`, { method: 'DELETE' });
      await loadStations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete station');
    }
  };

  const handleMove = async (s: Station, direction: 'up' | 'down') => {
    try {
      await apiRequest(`${API_URL}/api/v1/stations/${s.id}/move`, { method: 'POST', body: JSON.stringify({ direction }) });
      await loadStations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move station');
    }
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const sorted = [...stations].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 flex items-center justify-between">
            <p className="text-red-800 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 text-sm">Dismiss</button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kitchen Stations</CardTitle>
              <CardDescription>Configure and organize your kitchen stations</CardDescription>
            </div>
            <Button onClick={openCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Station
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-3 text-gray-600">Loading stations...</span>
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No stations configured yet
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((station, index) => (
                <div
                  key={station.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-8 rounded" style={{ backgroundColor: station.color }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{station.name}</h3>
                        {!station.active && <Badge variant="secondary">Disabled</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">
                        Code: <span className="font-mono">{station.code}</span>
                      </p>
                      {station.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {station.categories.map((cat) => (
                            <span key={cat} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{cat}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="flex flex-col">
                      <Button variant="ghost" size="sm" onClick={() => handleMove(station, 'up')} disabled={index === 0} className="h-6 px-2">
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleMove(station, 'down')} disabled={index === sorted.length - 1} className="h-6 px-2">
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(station)} className="text-blue-600 hover:bg-blue-50">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(station)} className="text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Station Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingStation ? 'Edit Station' : 'Create Station'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Hot Kitchen, Grill"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station Code *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  placeholder="e.g., hot_kitchen"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, color }))}
                      className={`w-8 h-8 rounded border-2 ${formData.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
                  {AVAILABLE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        formData.categories.includes(cat) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData((p) => ({ ...p, active: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Station is active</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingStation ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
