'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, Settings, Save, X, ChevronUp, ChevronDown, AlertTriangle, RefreshCw, Archive, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Station {
  id: string;
  restaurant_id: string;
  name: string;
  code: string;
  type: string;
  location?: string;
  capacity: number;
  active_status: boolean;
  description?: string;
  color: string;
  display_order: number;
  categories: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface User {
  id: string;
  email: string;
  role: 'admin' | 'owner' | 'staff';
  restaurant_id: string;
}

interface Permissions {
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_soft_delete: boolean;
}

interface StationFormData {
  name: string;
  code: string;
  type: string;
  location: string;
  capacity: number;
  description: string;
  color: string;
  categories: string[];
  active_status: boolean;
}

const STATION_TYPES = [
  { value: 'hot_kitchen', label: 'Hot Kitchen' },
  { value: 'cold_prep', label: 'Cold Prep' },
  { value: 'grill', label: 'Grill Station' },
  { value: 'bar', label: 'Bar' },
  { value: 'pizza', label: 'Pizza Station' },
  { value: 'pasta', label: 'Pasta Station' },
  { value: 'salad', label: 'Salad Station' },
  { value: 'dessert', label: 'Dessert Station' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'expo', label: 'Expo' }
];

const AVAILABLE_CATEGORIES = [
  'pizza', 'pasta', 'meat', 'fish', 'salad', 'appetizer', 'dessert',
  'grill', 'drinks', 'wine', 'cocktails', 'hot', 'cold', 'sides',
  'soup', 'bread', 'seafood', 'vegetarian', 'vegan'
];

const DEFAULT_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
];

export default function AdminStationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ station: Station | null, type: 'hard' | 'soft' }>({
    station: null,
    type: 'soft'
  });
  const [showDeleted, setShowDeleted] = useState(false);
  const [user, setUser] = useState<User>({
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'admin@losteria.com',
    role: 'admin',
    restaurant_id: 'c1cbea71-ece5-4d63-bb12-fe06b03d1140'
  });
  const [permissions, setPermissions] = useState<Permissions>({
    can_create: false,
    can_edit: false,
    can_delete: false,
    can_soft_delete: false
  });
  const [formData, setFormData] = useState<StationFormData>({
    name: '',
    code: '',
    type: 'hot_kitchen',
    location: '',
    capacity: 5,
    description: '',
    color: DEFAULT_COLORS[0],
    categories: [],
    active_status: true
  });

  const loadStations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = `/api/restaurants/${user.restaurant_id}/stations${showDeleted ? '?include_deleted=true' : ''}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load stations: ${response.status}`);
      }
      
      const data = await response.json();
      setStations(data.stations || []);
      setPermissions(data.permissions || {
        can_create: false,
        can_edit: false,
        can_delete: false,
        can_soft_delete: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stations');
      console.error('Error loading stations:', err);
    } finally {
      setLoading(false);
    }
  }, [user.restaurant_id, showDeleted]);

  // Load stations on component mount
  useEffect(() => {
    loadStations();
  }, [showDeleted, loadStations]);

  const handleCreateStation = () => {
    setEditingStation(null);
    setFormData({
      name: '',
      code: '',
      type: 'hot_kitchen',
      location: '',
      capacity: 5,
      description: '',
      color: DEFAULT_COLORS[0],
      categories: [],
      active_status: true
    });
    setShowForm(true);
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      code: station.code,
      type: station.type,
      location: station.location || '',
      capacity: station.capacity,
      description: station.description || '',
      color: station.color,
      categories: station.categories,
      active_status: station.active_status
    });
    setShowForm(true);
  };

  const handleSaveStation = async () => {
    try {
      // Validate form data
      if (!formData.name.trim() || !formData.code.trim()) {
        throw new Error('Name and code are required');
      }

      const payload = {
        ...formData,
        code: formData.code.toLowerCase().replace(/\s+/g, '_'),
        name: formData.name.trim()
      };

      const url = editingStation 
        ? `/api/restaurants/${user.restaurant_id}/stations/${editingStation.id}`
        : `/api/restaurants/${user.restaurant_id}/stations`;
      
      const method = editingStation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingStation ? 'update' : 'create'} station`);
      }

      // Refresh stations list
      await loadStations();
      
      // Close form
      setShowForm(false);
      setEditingStation(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save station');
    }
  };

  const handleDeleteStation = async (station: Station, deleteType: 'hard' | 'soft') => {
    try {
      let url: string;
      let method: string;

      if (deleteType === 'hard') {
        url = `/api/restaurants/${user.restaurant_id}/stations/${station.id}`;
        method = 'DELETE';
      } else {
        url = `/api/restaurants/${user.restaurant_id}/stations/${station.id}/deactivate`;
        method = 'PATCH';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${deleteType} delete station`);
      }

      // Refresh stations list
      await loadStations();
      setDeleteConfirm({ station: null, type: 'soft' });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete station');
    }
  };

  const handleRestoreStation = async (station: Station) => {
    try {
      const response = await fetch(`/api/restaurants/${user.restaurant_id}/stations/${station.id}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer demo-token',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restore station');
      }

      await loadStations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore station');
    }
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const activeStations = stations.filter(s => !s.deleted_at);
  const deletedStations = stations.filter(s => s.deleted_at);
  const displayStations = showDeleted ? deletedStations : activeStations;
  const sortedStations = [...displayStations].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Kitchen Stations Management
              </h1>
              <p className="text-gray-600 mt-1">
                Configure and organize kitchen stations with role-based permissions
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="text-sm text-gray-500">
                  Role: <span className="font-medium capitalize text-gray-900">{user.role}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  Permissions:
                  {permissions.can_create && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Create</span>}
                  {permissions.can_edit && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Edit</span>}
                  {permissions.can_soft_delete && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">Deactivate</span>}
                  {permissions.can_delete && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Delete</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {user.role === 'admin' && (
                <Button 
                  variant="secondary"
                  onClick={() => setShowDeleted(!showDeleted)}
                  className="flex items-center gap-2"
                >
                  {showDeleted ? <Settings className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  {showDeleted ? 'Show Active' : 'Show Deleted'}
                </Button>
              )}
              {permissions.can_create && (
                <Button 
                  onClick={handleCreateStation}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Station
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <strong className="text-red-800">Error:</strong>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm underline mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading stations...</span>
          </div>
        </div>
      )}

      {/* Stations List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {showDeleted ? 'Deleted Stations' : 'Active Stations'} ({sortedStations.length})
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={loadStations}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
            
            {sortedStations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  {showDeleted ? 'No deleted stations' : 'No stations configured yet'}
                </div>
                {!showDeleted && permissions.can_create && (
                  <Button 
                    onClick={handleCreateStation}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Station
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedStations.map((station, index) => (
                  <div
                    key={station.id}
                    className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                      station.deleted_at ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Color Indicator */}
                      <div
                        className="w-4 h-8 rounded"
                        style={{ backgroundColor: station.color }}
                      />
                      
                      {/* Station Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${station.deleted_at ? 'text-red-900' : 'text-gray-900'}`}>
                            {station.name}
                          </h3>
                          {!station.active_status && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              Disabled
                            </span>
                          )}
                          {station.deleted_at && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                              Deleted
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Code: <span className="font-mono">{station.code}</span>
                          {station.location && <> • Location: {station.location}</>}
                          • Capacity: {station.capacity}
                        </p>
                        {station.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {station.categories.map(category => (
                              <span
                                key={category}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                        {station.deleted_at && (
                          <p className="text-xs text-red-600 mt-1">
                            Deleted: {new Date(station.deleted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Restore Button for Deleted Stations */}
                      {station.deleted_at && user.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreStation(station)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Move Buttons (only for active stations) */}
                      {!station.deleted_at && permissions.can_edit && (
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={index === 0}
                            className="h-6 px-2"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={index === sortedStations.length - 1}
                            className="h-6 px-2"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {!station.deleted_at && permissions.can_edit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStation(station)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {!station.deleted_at && permissions.can_soft_delete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ station, type: 'soft' })}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {!station.deleted_at && permissions.can_delete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ station, type: 'hard' })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Station Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingStation ? 'Edit Station' : 'Create New Station'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Station Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Station Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Hot Kitchen, Cold Prep, Grill"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Station Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Station Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                    placeholder="e.g., hot_kitchen"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    required
                  />
                </div>

                {/* Station Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Station Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Main Kitchen, Prep Area"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 5 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description of the station"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Color */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-8 h-8 rounded border border-gray-300"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
                    {AVAILABLE_CATEGORIES.map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          formData.categories.includes(category)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active_status}
                      onChange={(e) => setFormData(prev => ({ ...prev, active_status: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Station is active and can receive orders
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveStation}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingStation ? 'Update Station' : 'Create Station'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.station && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className={`w-6 h-6 mr-3 ${deleteConfirm.type === 'hard' ? 'text-red-500' : 'text-orange-500'}`} />
                <h3 className="text-lg font-medium text-gray-900">
                  {deleteConfirm.type === 'hard' ? 'Permanently Delete' : 'Deactivate'} Station
                </h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  {deleteConfirm.type === 'hard' 
                    ? `Are you sure you want to permanently delete "${deleteConfirm.station.name}"? This action cannot be undone.`
                    : `Are you sure you want to deactivate "${deleteConfirm.station.name}"? It will be hidden from active use but can be restored later.`
                  }
                </p>
                
                {deleteConfirm.type === 'hard' && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800 text-sm">
                      <strong>Warning:</strong> This will permanently remove the station and all its configuration.
                      Any orders currently assigned to this station will need to be reassigned.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteConfirm({ station: null, type: 'soft' })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteStation(deleteConfirm.station!, deleteConfirm.type)}
                  className={deleteConfirm.type === 'hard' 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                  }
                >
                  {deleteConfirm.type === 'hard' ? 'Delete Permanently' : 'Deactivate Station'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}