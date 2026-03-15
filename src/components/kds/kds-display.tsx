'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { StationColumn } from './station-column';
import { KDSHeader } from './kds-header';
import { useKDSStore, useOrdersByStation, useKitchenMetrics } from '@/store/kds-store';
import { useSocket } from '@/hooks/use-socket';
import { ordersApi, stationsApi, displayApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export const KDSDisplay: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const { isConnected } = useSocket(); // Re-enabled

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

        // Load in parallel for better performance
        console.log('🔄 Loading initial data...');
        
        const [ordersResponse, stationsResponse, configResponse] = await Promise.all([
          ordersApi.getAll().then(res => {
            console.log('📦 Orders API response type:', typeof res, 'isArray:', Array.isArray(res));
            console.log('📦 Orders API response:', res);
            return res;
          }).catch(err => {
            console.error('❌ Orders API error:', err);
            return []; // Return empty array on error
          }),
          stationsApi.getAll().then(res => {
            console.log('🏪 Stations API response type:', typeof res, 'isArray:', Array.isArray(res));
            console.log('🏪 Stations API response:', res);
            return res;
          }).catch(err => {
            console.error('❌ Stations API error:', err);
            return []; // Return empty array on error
          }),
          displayApi.getConfig().then(res => {
            console.log('⚙️ Config API response type:', typeof res);
            console.log('⚙️ Config API response:', res);
            return res;
          }).catch(err => {
            console.log('⚙️ Config API error (optional):', err);
            return null;
          })
        ]);

        console.log('✅ All API calls completed');

        // Handle orders response format
        if (Array.isArray(ordersResponse)) {
          console.log('Setting orders (direct array):', ordersResponse.length, 'orders');
          stableSetOrders(ordersResponse);
        } else if (ordersResponse?.success && ordersResponse?.orders) {
          console.log('Setting orders (wrapped response):', ordersResponse.orders.length, 'orders');
          stableSetOrders(ordersResponse.orders);
        } else {
          console.error('Unexpected orders response format:', ordersResponse);
        }

        // Handle stations response format
        if (Array.isArray(stationsResponse)) {
          console.log('Setting stations (direct array):', stationsResponse.length, 'stations');
          stableSetStations(stationsResponse);
        } else if (stationsResponse?.success && stationsResponse?.stations) {
          console.log('Setting stations (wrapped response):', stationsResponse.stations.length, 'stations');
          stableSetStations(stationsResponse.stations);
        } else {
          console.error('Unexpected stations response format:', stationsResponse);
        }

        if (configResponse && typeof configResponse === 'object') {
          // Handle both wrapped and direct config responses
          if ('success' in configResponse && configResponse.success && configResponse.config) {
            stableSetConfig(configResponse.config);
          } else if ('restaurant_id' in configResponse) {
            // Direct config response - cast to DisplayConfig type
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
  }, [stableSetOrders, stableSetStations, stableSetConfig]); // Include stable callbacks

  // Refresh orders every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const response = await ordersApi.getAll();
        // Handle both array and wrapped response formats
        if (Array.isArray(response)) {
          stableSetOrders(response);
        } else if (response?.success && response?.orders) {
          stableSetOrders(response.orders);
        }
      } catch (error) {
        console.error('Failed to refresh orders:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [stableSetOrders]); // Include stable setOrders callback

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

  // Filter stations based on selection - temporarily showing all active stations for debugging
  const activeStations = stations.filter(station => station.active);
  
  // Debug logging (can be removed in production)
  // console.log('Debug - Stations:', stations);
  // console.log('Debug - Selected Stations:', selectedStations);
  // console.log('Debug - Active Stations:', activeStations);

  if (isLoading) {
    return (
      <div className="kds-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading Kitchen Display...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kds-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-white text-xl mb-2">Connection Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kds-container">
      {/* Header */}
      <KDSHeader 
        isConnected={isConnected}
        metrics={kitchenMetrics}
        stations={stations}
        config={config}
      />

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
          ⚠️ Disconnected from server - Orders may not update in real-time
        </div>
      )}

      {/* Main Display Grid */}
      <div className="flex-1 overflow-hidden">
        {activeStations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🍽️</div>
              <h2 className="text-xl mb-2">No Active Stations</h2>
              <p className="text-gray-300">Configure stations to start displaying orders</p>
            </div>
          </div>
        ) : (
          <div 
            className={cn('grid gap-4 p-4 h-full', {
              'grid-cols-1': activeStations.length === 1,
              'grid-cols-2': activeStations.length === 2,
              'grid-cols-3': activeStations.length === 3,
              'grid-cols-4': activeStations.length >= 4,
            })}
          >
            {activeStations
              .sort((a, b) => a.display_order - b.display_order)
              .map((station) => (
                <StationColumn
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

      {/* Footer Stats */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex justify-between items-center text-sm text-gray-300">
          <div className="flex gap-6">
            <span>Total Orders: <span className="text-white font-medium">{kitchenMetrics.total}</span></span>
            <span>New: <span className="text-status-new font-medium">{kitchenMetrics.new}</span></span>
            <span>Preparing: <span className="text-status-preparing font-medium">{kitchenMetrics.preparing}</span></span>
            <span>Ready: <span className="text-status-ready font-medium">{kitchenMetrics.ready}</span></span>
          </div>
          <div className="flex gap-6">
            {kitchenMetrics.overdue > 0 && (
              <span className="text-red-400 font-medium animate-pulse">
                {kitchenMetrics.overdue} Overdue
              </span>
            )}
            <span>Avg Time: <span className="text-white font-medium">{kitchenMetrics.avgPrepTime}m</span></span>
            <span className={cn('font-medium', {
              'text-green-400': isConnected,
              'text-red-400': !isConnected
            })}>
              {isConnected ? '🟢 LIVE' : '🔴 OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};