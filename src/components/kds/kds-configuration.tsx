'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Monitor, 
  Volume2, 
  Palette, 
  Clock, 
  Zap, 
  BarChart3, 
  Plus, 
  Minus,
  Save,
  X,
  ChefHat,
  Layout,
  Bell,
  Target,
  Gauge,
  Trash2,
  Edit3,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Station, DisplayConfig } from '@/types';

interface KDSConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
  config: DisplayConfig | null;
  stations: Station[];
  onSaveConfig: (config: Partial<DisplayConfig>) => Promise<void>;
  onSaveStations: (stations: Station[]) => Promise<void>;
}

export const KDSConfiguration: React.FC<KDSConfigurationProps> = ({
  isOpen,
  onClose,
  config,
  stations,
  onSaveConfig,
  onSaveStations
}) => {
  // Local state for configuration
  const [localConfig, setLocalConfig] = useState<Partial<DisplayConfig>>({
    display_layout: {
      columns: 4,
      max_orders_per_column: 8,
      card_size: 'medium',
      show_station_headers: true,
      compact_mode: false,
    },
    show_order_times: true,
    show_customer_info: true,
    show_special_requests: true,
    show_item_quantities: true,
    sound_enabled: true,
    sound_volume: 70,
    notification_sounds: {
      new_order: 'chime',
      order_ready: 'bell',
      order_overdue: 'urgent',
      order_cancelled: 'soft'
    },
    auto_bump_ready_orders: false,
    auto_bump_delay: 300,
    time_warnings: {
      yellow_threshold: 80,
      red_threshold: 120,
      critical_threshold: 150,
    },
    filters: {
      hide_completed: false,
      hide_cancelled: true,
      group_by_station: true,
      sort_by: 'order_time'
    },
    theme: 'dark',
    refresh_interval: 30,
  });

  const [localStations, setLocalStations] = useState<Station[]>([]);
  const [activeTab, setActiveTab] = useState<'display' | 'stations' | 'sounds' | 'theme' | 'timing' | 'performance'>('display');
  const [isEditing, setIsEditing] = useState(false);
  const [newStationName, setNewStationName] = useState('');

  // Initialize local state from props
  useEffect(() => {
    if (config) {
      setLocalConfig(prev => ({
        ...prev,
        ...config
      }));
    }
    if (stations) {
      setLocalStations([...stations]);
    }
  }, [config, stations]);

  const handleSave = async () => {
    try {
      await onSaveConfig(localConfig);
      await onSaveStations(localStations);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const addStation = () => {
    if (!newStationName.trim()) return;

    const newStation: Station = {
      id: `station_${Date.now()}`,
      restaurant_id: 'temp_id',
      name: newStationName,
      code: newStationName.toLowerCase().replace(/\s+/g, '_'),
      description: `${newStationName} station`,
      color: '#4d6aff',
      display_order: localStations.length + 1,
      active: true,
      estimated_capacity: 10,
      current_load: 0,
      categories: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setLocalStations([...localStations, newStation]);
    setNewStationName('');
  };

  const removeStation = (stationId: string) => {
    setLocalStations(localStations.filter(s => s.id !== stationId));
  };

  const toggleStationActive = (stationId: string) => {
    setLocalStations(localStations.map(s => 
      s.id === stationId ? { ...s, active: !s.active } : s
    ));
  };

  const updateStationOrder = (stationId: string, newOrder: number) => {
    setLocalStations(localStations.map(s => 
      s.id === stationId ? { ...s, display_order: newOrder } : s
    ));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'display' as const, label: 'Display', icon: Monitor },
    { id: 'stations' as const, label: 'Stations', icon: ChefHat },
    { id: 'sounds' as const, label: 'Sounds', icon: Volume2 },
    { id: 'theme' as const, label: 'Theme', icon: Palette },
    { id: 'timing' as const, label: 'Timing', icon: Clock },
    { id: 'performance' as const, label: 'Performance', icon: BarChart3 },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-600 max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gray-700 border-b border-gray-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-ada-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">KDS Configuration</h2>
                <p className="text-gray-400">Customize your kitchen display system</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isEditing && (
                <Button onClick={handleSave} className="btn-success">
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </Button>
              )}
              <Button onClick={onClose} className="btn-secondary">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900 border-r border-gray-600 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors',
                      {
                        'bg-ada-500 text-white': activeTab === tab.id,
                        'text-gray-400 hover:text-white hover:bg-gray-800': activeTab !== tab.id
                      }
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Display Settings */}
            {activeTab === 'display' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Display Layout</h3>
                
                {/* Columns */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-bold text-white">Number of Columns</label>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            display_layout: {
                              ...prev.display_layout!,
                              columns: Math.max(1, (prev.display_layout?.columns || 4) - 1)
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className="btn-secondary p-2"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-2xl text-white min-w-[2rem] text-center">
                        {localConfig.display_layout?.columns || 4}
                      </span>
                      <Button 
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            display_layout: {
                              ...prev.display_layout!,
                              columns: Math.min(6, (prev.display_layout?.columns || 4) + 1)
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className="btn-secondary p-2"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Max Orders Per Column */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-bold text-white">Max Orders Per Column</label>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            display_layout: {
                              ...prev.display_layout!,
                              max_orders_per_column: Math.max(4, (prev.display_layout?.max_orders_per_column || 8) - 1)
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className="btn-secondary p-2"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-2xl text-white min-w-[2rem] text-center">
                        {localConfig.display_layout?.max_orders_per_column || 8}
                      </span>
                      <Button 
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            display_layout: {
                              ...prev.display_layout!,
                              max_orders_per_column: Math.min(20, (prev.display_layout?.max_orders_per_column || 8) + 1)
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className="btn-secondary p-2"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Card Size */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <label className="font-bold text-white block mb-3">Card Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            display_layout: {
                              ...prev.display_layout!,
                              card_size: size as 'small' | 'medium' | 'large'
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className={cn(
                          'py-2 px-4 rounded-lg font-medium capitalize transition-colors',
                          {
                            'bg-ada-500 text-white': localConfig.display_layout?.card_size === size,
                            'bg-gray-600 text-gray-300 hover:bg-gray-500': localConfig.display_layout?.card_size !== size
                          }
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Options */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3">Display Options</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-white">Show Customer Information</span>
                      <button
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            show_customer_info: !prev.show_customer_info
                          }));
                          setIsEditing(true);
                        }}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          {
                            'bg-ada-500': localConfig.show_customer_info,
                            'bg-gray-600': !localConfig.show_customer_info
                          }
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          {
                            'translate-x-6': localConfig.show_customer_info,
                            'translate-x-1': !localConfig.show_customer_info
                          }
                        )} />
                      </button>
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-white">Show Order Times</span>
                      <button
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            show_order_times: !prev.show_order_times
                          }));
                          setIsEditing(true);
                        }}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          {
                            'bg-ada-500': localConfig.show_order_times,
                            'bg-gray-600': !localConfig.show_order_times
                          }
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          {
                            'translate-x-6': localConfig.show_order_times,
                            'translate-x-1': !localConfig.show_order_times
                          }
                        )} />
                      </button>
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-white">Show Special Requests</span>
                      <button
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            show_special_requests: !prev.show_special_requests
                          }));
                          setIsEditing(true);
                        }}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          {
                            'bg-ada-500': localConfig.show_special_requests,
                            'bg-gray-600': !localConfig.show_special_requests
                          }
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          {
                            'translate-x-6': localConfig.show_special_requests,
                            'translate-x-1': !localConfig.show_special_requests
                          }
                        )} />
                      </button>
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-white">Show Item Quantities</span>
                      <button
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            show_item_quantities: !prev.show_item_quantities
                          }));
                          setIsEditing(true);
                        }}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          {
                            'bg-ada-500': localConfig.show_item_quantities,
                            'bg-gray-600': !localConfig.show_item_quantities
                          }
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          {
                            'translate-x-6': localConfig.show_item_quantities,
                            'translate-x-1': !localConfig.show_item_quantities
                          }
                        )} />
                      </button>
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-white">Compact Mode</span>
                      <button
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            display_layout: {
                              ...prev.display_layout!,
                              compact_mode: !prev.display_layout?.compact_mode
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          {
                            'bg-ada-500': localConfig.display_layout?.compact_mode,
                            'bg-gray-600': !localConfig.display_layout?.compact_mode
                          }
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          {
                            'translate-x-6': localConfig.display_layout?.compact_mode,
                            'translate-x-1': !localConfig.display_layout?.compact_mode
                          }
                        )} />
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Station Management */}
            {activeTab === 'stations' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Station Management</h3>
                
                {/* Add New Station */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3">Add New Station</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newStationName}
                      onChange={(e) => setNewStationName(e.target.value)}
                      placeholder="Station name (e.g., Hot Kitchen, Cold Prep)"
                      className="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                    />
                    <Button onClick={addStation} className="btn-primary">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Station
                    </Button>
                  </div>
                </div>

                {/* Existing Stations */}
                <div className="space-y-3">
                  {localStations.map((station, index) => (
                    <div key={station.id} className="bg-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">#{station.display_order}</span>
                            <ChefHat className="h-5 w-5 text-ada-400" />
                            <span className="font-bold text-white text-lg">{station.name}</span>
                          </div>
                          <div className={cn(
                            'px-2 py-1 rounded text-xs font-bold',
                            {
                              'bg-green-500/20 text-green-400': station.active,
                              'bg-gray-500/20 text-gray-400': !station.active
                            }
                          )}>
                            {station.active ? 'ACTIVE' : 'INACTIVE'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => {
                              toggleStationActive(station.id);
                              setIsEditing(true);
                            }}
                            className={cn('btn-secondary', {
                              'text-green-400 hover:text-green-300': !station.active,
                              'text-red-400 hover:text-red-300': station.active
                            })}
                          >
                            {station.active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            onClick={() => {
                              removeStation(station.id);
                              setIsEditing(true);
                            }}
                            className="btn-danger p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sound Settings */}
            {activeTab === 'sounds' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Sound & Notifications</h3>
                
                {/* Master Volume */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-bold text-white">Master Volume</label>
                    <span className="text-ada-400 font-bold">{localConfig.sound_volume || 70}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localConfig.sound_volume || 70}
                    onChange={(e) => {
                      setLocalConfig(prev => ({
                        ...prev,
                        sound_volume: parseInt(e.target.value)
                      }));
                      setIsEditing(true);
                    }}
                    className="w-full"
                  />
                </div>

                {/* Sound Options */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3">Sound Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-5 w-5 text-ada-400" />
                        <span className="text-white">Enable All Sounds</span>
                      </div>
                      <button
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            sound_enabled: !prev.sound_enabled
                          }));
                          setIsEditing(true);
                        }}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          {
                            'bg-ada-500': localConfig.sound_enabled,
                            'bg-gray-600': !localConfig.sound_enabled
                          }
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          {
                            'translate-x-6': localConfig.sound_enabled,
                            'translate-x-1': !localConfig.sound_enabled
                          }
                        )} />
                      </button>
                    </label>
                  </div>
                  
                  {/* Sound Types */}
                  {localConfig.sound_enabled && (
                    <div className="mt-4 space-y-3">
                      <h5 className="text-sm font-bold text-gray-300 mb-2">Notification Sounds</h5>
                      {[
                        { key: 'new_order', label: 'New Order', current: localConfig.notification_sounds?.new_order || 'chime' },
                        { key: 'order_ready', label: 'Order Ready', current: localConfig.notification_sounds?.order_ready || 'bell' },
                        { key: 'order_overdue', label: 'Order Overdue', current: localConfig.notification_sounds?.order_overdue || 'urgent' },
                      ].map((sound) => (
                        <div key={sound.key} className="flex items-center justify-between">
                          <span className="text-white text-sm">{sound.label}</span>
                          <select
                            value={sound.current}
                            onChange={(e) => {
                              setLocalConfig(prev => ({
                                ...prev,
                                notification_sounds: {
                                  ...prev.notification_sounds!,
                                  [sound.key]: e.target.value
                                }
                              }));
                              setIsEditing(true);
                            }}
                            className="bg-gray-600 text-white border border-gray-500 rounded px-2 py-1 text-sm"
                          >
                            <option value="chime">Chime</option>
                            <option value="bell">Bell</option>
                            <option value="urgent">Urgent</option>
                            <option value="soft">Soft</option>
                            <option value="none">None</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Theme Settings */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Theme & Appearance</h3>
                
                {/* Theme Options */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3">Theme Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-white">Theme Mode</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setLocalConfig(prev => ({
                              ...prev,
                              theme: 'light'
                            }));
                            setIsEditing(true);
                          }}
                          className={cn(
                            'px-3 py-1 rounded-lg text-sm font-medium',
                            {
                              'bg-ada-500 text-white': localConfig.theme === 'light',
                              'bg-gray-600 text-gray-300': localConfig.theme !== 'light'
                            }
                          )}
                        >
                          Light
                        </button>
                        <button
                          onClick={() => {
                            setLocalConfig(prev => ({
                              ...prev,
                              theme: 'dark'
                            }));
                            setIsEditing(true);
                          }}
                          className={cn(
                            'px-3 py-1 rounded-lg text-sm font-medium',
                            {
                              'bg-ada-500 text-white': localConfig.theme === 'dark',
                              'bg-gray-600 text-gray-300': localConfig.theme !== 'dark'
                            }
                          )}
                        >
                          Dark
                        </button>
                      </div>
                    </label>
                  </div>
                  
                  <div className="mt-3 p-3 bg-blue-500/20 rounded-lg border border-blue-500/50">
                    <div className="text-blue-400 text-sm">
                      <strong>Note:</strong> Dark mode is recommended for kitchen environments to reduce eye strain and improve visibility.
                    </div>
                  </div>
                </div>

                {/* Refresh Interval */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3">Refresh Interval</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">Auto-refresh every</span>
                    <span className="text-ada-400 font-bold">{localConfig.refresh_interval || 30} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={localConfig.refresh_interval || 30}
                    onChange={(e) => {
                      setLocalConfig(prev => ({
                        ...prev,
                        refresh_interval: parseInt(e.target.value)
                      }));
                      setIsEditing(true);
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>10s</span>
                    <span>30s</span>
                    <span>60s</span>
                    <span>2m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Timing Settings */}
            {activeTab === 'timing' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Time Warnings & Auto-Bump</h3>
                
                {/* Warning Thresholds */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3">Time Warning Thresholds</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white">Yellow Warning (%)</label>
                        <span className="text-amber-400 font-bold">{localConfig.time_warnings?.yellow_threshold || 80}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={localConfig.time_warnings?.yellow_threshold || 80}
                        onChange={(e) => {
                          setLocalConfig(prev => ({
                            ...prev,
                            time_warnings: {
                              ...prev.time_warnings!,
                              yellow_threshold: parseInt(e.target.value)
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white">Red Alert (%)</label>
                        <span className="text-red-400 font-bold">{localConfig.time_warnings?.red_threshold || 120}%</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="150"
                        value={localConfig.time_warnings?.red_threshold || 120}
                        onChange={(e) => {
                          setLocalConfig(prev => ({
                            ...prev,
                            time_warnings: {
                              ...prev.time_warnings!,
                              red_threshold: parseInt(e.target.value)
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white">Critical Alert (%)</label>
                        <span className="text-red-500 font-bold">{localConfig.time_warnings?.critical_threshold || 150}%</span>
                      </div>
                      <input
                        type="range"
                        min="120"
                        max="200"
                        value={localConfig.time_warnings?.critical_threshold || 150}
                        onChange={(e) => {
                          setLocalConfig(prev => ({
                            ...prev,
                            time_warnings: {
                              ...prev.time_warnings!,
                              critical_threshold: parseInt(e.target.value)
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Auto-Bump Settings */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3">Auto-Bump Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-white">Enable Auto-Bump for Ready Orders</span>
                      <button
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            auto_bump_ready_orders: !prev.auto_bump_ready_orders
                          }));
                          setIsEditing(true);
                        }}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          {
                            'bg-ada-500': localConfig.auto_bump_ready_orders,
                            'bg-gray-600': !localConfig.auto_bump_ready_orders
                          }
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          {
                            'translate-x-6': localConfig.auto_bump_ready_orders,
                            'translate-x-1': !localConfig.auto_bump_ready_orders
                          }
                        )} />
                      </button>
                    </label>
                    
                    {localConfig.auto_bump_ready_orders && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-white">Auto-Bump Delay (seconds)</label>
                          <span className="text-ada-400 font-bold">{localConfig.auto_bump_delay || 300}s</span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="600"
                          step="30"
                          value={localConfig.auto_bump_delay || 300}
                          onChange={(e) => {
                            setLocalConfig(prev => ({
                              ...prev,
                              auto_bump_delay: parseInt(e.target.value)
                            }));
                            setIsEditing(true);
                          }}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>1m</span>
                          <span>5m</span>
                          <span>10m</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Settings */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Display Filters & Performance</h3>
                
                {/* Display Filters */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3">Order Filters</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-ada-400" />
                        <span className="text-white">Hide Completed Orders</span>
                      </div>
                      <button
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            filters: {
                              ...prev.filters!,
                              hide_completed: !prev.filters?.hide_completed
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          {
                            'bg-ada-500': localConfig.filters?.hide_completed,
                            'bg-gray-600': !localConfig.filters?.hide_completed
                          }
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          {
                            'translate-x-6': localConfig.filters?.hide_completed,
                            'translate-x-1': !localConfig.filters?.hide_completed
                          }
                        )} />
                      </button>
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <X className="h-5 w-5 text-ada-400" />
                        <span className="text-white">Hide Cancelled Orders</span>
                      </div>
                      <button
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            filters: {
                              ...prev.filters!,
                              hide_cancelled: !prev.filters?.hide_cancelled
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          {
                            'bg-ada-500': localConfig.filters?.hide_cancelled,
                            'bg-gray-600': !localConfig.filters?.hide_cancelled
                          }
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          {
                            'translate-x-6': localConfig.filters?.hide_cancelled,
                            'translate-x-1': !localConfig.filters?.hide_cancelled
                          }
                        )} />
                      </button>
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Layout className="h-5 w-5 text-ada-400" />
                        <span className="text-white">Group by Station</span>
                      </div>
                      <button
                        onClick={() => {
                          setLocalConfig(prev => ({
                            ...prev,
                            filters: {
                              ...prev.filters!,
                              group_by_station: !prev.filters?.group_by_station
                            }
                          }));
                          setIsEditing(true);
                        }}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          {
                            'bg-ada-500': localConfig.filters?.group_by_station,
                            'bg-gray-600': !localConfig.filters?.group_by_station
                          }
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          {
                            'translate-x-6': localConfig.filters?.group_by_station,
                            'translate-x-1': !localConfig.filters?.group_by_station
                          }
                        )} />
                      </button>
                    </label>
                  </div>
                </div>
                
                {/* Sort Options */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3">Order Sorting</h4>
                  <div className="space-y-3">
                    <label className="block text-white mb-2">Sort Orders By</label>
                    <select
                      value={localConfig.filters?.sort_by || 'order_time'}
                      onChange={(e) => {
                        setLocalConfig(prev => ({
                          ...prev,
                          filters: {
                            ...prev.filters!,
                            sort_by: e.target.value as 'order_time' | 'priority' | 'estimated_time'
                          }
                        }));
                        setIsEditing(true);
                      }}
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="order_time">Order Time</option>
                      <option value="priority">Priority</option>
                      <option value="estimated_time">Estimated Time</option>
                    </select>
                  </div>
                </div>

                {/* Performance Info */}
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-6 w-6 text-blue-400 mt-1" />
                    <div>
                      <h4 className="font-bold text-blue-400 mb-2">Performance Tracking</h4>
                      <p className="text-blue-300 text-sm leading-relaxed">
                        The KDS automatically tracks preparation times, station efficiency, and order completion rates. 
                        This data is used to optimize kitchen workflows and identify bottlenecks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};