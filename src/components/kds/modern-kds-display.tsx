'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ModernStationColumn } from './modern-station-column';
import { ModernKDSHeader } from './modern-kds-header';
import { KDSConfiguration } from './kds-configuration';
import { useKDSStore, useOrdersByStation, useKitchenMetrics } from '@/store/kds-store';
import { useSocket } from '@/hooks/use-socket';
import { ordersApi, stationsApi, displayApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { DisplayConfig } from '@/types';

export const ModernKDSDisplay: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const { 
    stations, 
    config, 
    selectedStations,
    setOrders, 
    setStations, 
    setConfig,
    bumpOrder: storeBumpOrder,
    markOrderCompleted
  } = useKDSStore();
  
  const ordersByStation = useOrdersByStation();
  const kitchenMetrics = useKitchenMetrics();
  const { isConnected } = useSocket();

  // Create stable callbacks to avoid useEffect dependency issues
  const stableSetOrders = useCallback(setOrders, [setOrders]);
  const stableSetStations = useCallback(setStations, [setStations]);
  const stableSetConfig = useCallback(setConfig, [setConfig]);
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setError(null);
        setIsLoading(true);

        console.log('[Modern KDS] Loading initial data...');
        
        const [ordersResponse, stationsResponse, configResponse] = await Promise.all([
          ordersApi.getAll().then(res => {
            console.log('[ORDERS] API response:', res);
            return res;
          }).catch(err => {
            console.error('[ORDERS] API error:', err);
            return []; // Return empty array on error
          }),
          stationsApi.getAll().then(res => {
            console.log('[STATIONS] API response:', res);
            return res;
          }).catch(err => {
            console.error('[STATIONS] API error:', err);
            return []; // Return empty array on error
          }),
          displayApi.getConfig().then(res => {
            console.log('[CONFIG] API response:', res);
            return res;
          }).catch(err => {
            console.log('[CONFIG] API error (optional):', err);
            return null;
          })
        ]);

        // Handle orders response format
        if (Array.isArray(ordersResponse)) {
          stableSetOrders(ordersResponse);
        } else if (ordersResponse?.success && ordersResponse?.orders) {
          stableSetOrders(ordersResponse.orders);
        } else {
          console.error('Unexpected orders response format:', ordersResponse);
        }

        // Handle stations response format
        if (Array.isArray(stationsResponse)) {
          stableSetStations(stationsResponse);
        } else if (stationsResponse?.success && stationsResponse?.stations) {
          stableSetStations(stationsResponse.stations);
        } else {
          console.error('Unexpected stations response format:', stationsResponse);
        }

        if (configResponse && typeof configResponse === 'object') {
          // Handle both wrapped and direct config responses
          if ('success' in configResponse && configResponse.success && configResponse.config) {
            stableSetConfig(configResponse.config);
          } else if ('restaurant_id' in configResponse) {
            stableSetConfig(configResponse as any);
          }
        }

      } catch (error) {
        console.error('Failed to load KDS data:', error);
        setError('Failed to load kitchen data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [stableSetOrders, stableSetStations, stableSetConfig]);

  // Refresh orders every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const response = await ordersApi.getAll();
        if (Array.isArray(response)) {
          stableSetOrders(response);
        } else if (response?.success && response?.orders) {
          stableSetOrders(response.orders);
        }
      } catch (error) {
        console.error('Failed to refresh orders:', error);
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [stableSetOrders]);

  const handleBumpOrder = async (orderId: string) => {
    try {
      // Optimistic update
      storeBumpOrder(orderId);
      
      // API call
      await ordersApi.bump(orderId);
    } catch (error) {
      console.error('Failed to bump order:', error);
      // TODO: Revert optimistic update or show error
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      // Optimistic update
      markOrderCompleted(orderId);
      
      // API call
      await ordersApi.updateStatus(orderId, 'completed');
    } catch (error) {
      console.error('Failed to complete order:', error);
      // TODO: Revert optimistic update or show error
    }
  };

  const handleSaveConfig = async (newConfig: Partial<DisplayConfig>) => {
    try {
      // Merge with existing config and ensure required fields
      const updatedConfig: DisplayConfig = {
        restaurant_id: config?.restaurant_id || 'default',
        theme: 'dark',
        refresh_interval: 30,
        auto_bump_ready_orders: false,
        auto_bump_delay: 300,
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
        display_layout: {
          columns: 4,
          max_orders_per_column: 8,
          card_size: 'medium',
          show_station_headers: true,
          compact_mode: false,
        },
        station_colors: {},
        priority_colors: {
          low: '#9CA3AF',
          normal: '#3B82F6',
          high: '#F59E0B',
          urgent: '#EF4444'
        },
        status_colors: {
          new: '#10B981',
          preparing: '#F59E0B',
          ready: '#EF4444',
          completed: '#6B7280',
          cancelled: '#9CA3AF'
        },
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
        created_at: config?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...config,
        ...newConfig
      };
      
      // Save to API
      await displayApi.updateConfig(updatedConfig);
      
      // Update local state
      stableSetConfig(updatedConfig);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  };

  const handleSaveStations = async (newStations: any[]) => {
    try {
      // Save each station
      for (const station of newStations) {
        if (station.id.startsWith('station_')) {
          // New station - create
          await stationsApi.create(station);
        } else {
          // Existing station - update
          await stationsApi.update(station.id, station);
        }
      }
      
      // Update local state
      stableSetStations(newStations);
    } catch (error) {
      console.error('Failed to save stations:', error);
      throw error;
    }
  };

  // Filter stations based on selection and active status
  const activeStations = stations.filter(station => station.active);

  if (isLoading) {
    return (
      <div className="kds-container flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ada-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-2">Initializing Kitchen Display</h2>
          <p className="text-gray-400 text-lg">Loading orders and station data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kds-container flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-400 text-3xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary text-lg px-8 py-4"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kds-container">
      {/* Modern Header */}
      <ModernKDSHeader 
        isConnected={isConnected}
        metrics={kitchenMetrics}
        stations={stations}
        config={config}
        onConfigClick={() => setShowConfig(true)}
      />

      {/* Main Display Grid */}
      <div className="flex-1 overflow-hidden">
        {activeStations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700/50 border border-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-gray-400 text-sm font-bold">SETUP</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">No Active Stations</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md">
                Configure your kitchen stations to start displaying orders and managing kitchen workflow
              </p>
              <button 
                onClick={() => setShowConfig(true)}
                className="btn-primary text-lg px-8 py-4"
              >
                Configure Stations
              </button>
            </div>
          </div>
        ) : (
          <div 
            className={cn('grid gap-6 p-6 h-full', {
              'grid-cols-1': activeStations.length === 1,
              'grid-cols-2': activeStations.length === 2,
              'grid-cols-3': activeStations.length === 3,
              'grid-cols-4': activeStations.length === 4,
              'grid-cols-5': activeStations.length === 5,
              'grid-cols-6': activeStations.length >= 6,
            })}
          >
            {activeStations
              .sort((a, b) => a.display_order - b.display_order)
              .map((station) => (
                <ModernStationColumn
                  key={station.id}
                  station={station}
                  orders={ordersByStation[station.code] || []}
                  onBumpOrder={handleBumpOrder}
                  onCompleteOrder={handleCompleteOrder}
                  maxOrdersPerColumn={config?.display_layout?.max_orders_per_column || 8}
                />
              ))}
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      <KDSConfiguration
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        config={config}
        stations={stations}
        onSaveConfig={handleSaveConfig}
        onSaveStations={handleSaveStations}
      />

      {/* Modern Footer Stats */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-8 text-lg">
            <span className="text-gray-300">
              Total: <span className="text-white font-bold">{kitchenMetrics.total}</span>
            </span>
            <span className="text-emerald-400">
              New: <span className="font-bold">{kitchenMetrics.new}</span>
            </span>
            <span className="text-amber-400">
              Preparing: <span className="font-bold">{kitchenMetrics.preparing}</span>
            </span>
            <span className="text-red-400">
              Ready: <span className="font-bold">{kitchenMetrics.ready}</span>
            </span>
          </div>
          <div className="flex gap-8 text-lg">
            {kitchenMetrics.overdue > 0 && (
              <span className="text-red-400 font-bold animate-pulse">
                {kitchenMetrics.overdue} Overdue
              </span>
            )}
            <span className="text-gray-300">
              Avg: <span className="text-white font-bold">{kitchenMetrics.avgPrepTime}m</span>
            </span>
            <span className={cn('font-bold text-lg', {
              'text-emerald-400': isConnected,
              'text-red-400 animate-pulse': !isConnected
            })}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};