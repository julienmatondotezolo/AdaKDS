'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Settings, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const AVAILABLE_CATEGORIES = [
  'pizza', 'pasta', 'meat', 'fish', 'salad', 'appetizer', 'dessert',
  'grill', 'drinks', 'wine', 'cocktails', 'hot', 'cold', 'sides',
  'soup', 'bread', 'seafood', 'vegetarian', 'vegan'
];

const DEFAULT_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
];

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState<StationFormData>({
    name: '',
    code: '',
    color: DEFAULT_COLORS[0],
    categories: [],
    active: true
  });

  // Load stations on component mount
  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/stations');
      if (!response.ok) {
        throw new Error(`Failed to load stations: ${response.status}`);
      }
      
      const data = await response.json();
      setStations(data.stations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stations');
      console.error('Error loading stations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStation = () => {
    setEditingStation(null);
    setFormData({
      name: '',
      code: '',
      color: DEFAULT_COLORS[0],
      categories: [],
      active: true
    });
    setShowForm(true);
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      code: station.code,
      color: station.color,
      categories: station.categories,
      active: station.active
    });
    setShowForm(true);
  };

  const handleSaveStation = async () => {
    try {
      // Validate form data
      if (!formData.name.trim() || !formData.code.trim()) {
        throw new Error('Name and code are required');
      }

      // Generate code from name if empty
      const code = formData.code.trim() || formData.name.toLowerCase().replace(/\s+/g, '_');

      const payload = {
        ...formData,
        code,
        name: formData.name.trim()
      };

      const url = editingStation 
        ? `/api/stations/${editingStation.id}`
        : '/api/stations';
      
      const method = editingStation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingStation ? 'update' : 'create'} station`);
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

  const handleDeleteStation = async (station: Station) => {
    if (!confirm(`Are you sure you want to delete station "${station.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/stations/${station.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete station');
      }

      // Refresh stations list
      await loadStations();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete station');
    }
  };

  const handleMoveStation = async (station: Station, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/stations/${station.id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) {
        throw new Error('Failed to move station');
      }

      // Refresh stations list
      await loadStations();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move station');
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

  const sortedStations = [...stations].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Kitchen Stations Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Configure and organize your kitchen stations for optimal order management
                </p>
              </div>
              <Button 
                onClick={handleCreateStation}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Station
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
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
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Kitchen Stations ({stations.length})
              </h2>
              
              {stations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">No stations configured yet</div>
                  <Button 
                    onClick={handleCreateStation}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Station
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedStations.map((station, index) => (
                    <div
                      key={station.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                            <h3 className="font-medium text-gray-900">
                              {station.name}
                            </h3>
                            {!station.active && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                Disabled
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Code: <span className="font-mono">{station.code}</span>
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
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Move Buttons */}
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveStation(station, 'up')}
                            disabled={index === 0}
                            className="h-6 px-2"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveStation(station, 'down')}
                            disabled={index === stations.length - 1}
                            className="h-6 px-2"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Action Buttons */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStation(station)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStation(station)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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

                <div className="space-y-4">
                  {/* Station Name */}
                  <div>
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
                      placeholder="e.g., hot_kitchen, cold_prep, grill"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used for API integration. Auto-generated from name if empty.
                    </p>
                  </div>

                  {/* Color */}
                  <div>
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
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-600">Custom:</span>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-8 h-8 rounded border border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categories
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Select which food categories this station handles
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
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

                  {/* Active Toggle */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
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
      </div>
    </div>
  );
}