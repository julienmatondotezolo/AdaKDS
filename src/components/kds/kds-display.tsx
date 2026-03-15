'use client';

import React, { useEffect, useState } from 'react';
import { StationColumn } from './station-column';
import { ProfessionalKDSHeader } from './professional-kds-header';
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
  const { isConnected } = useSocket();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // Load in parallel for better performance
        const [ordersResponse, stationsResponse, configResponse] = await Promise.all([
          ordersApi.getAll(),
          stationsApi.getAll(),
          displayApi.getConfig().catch(() => ({ success: true, config: null })) // Config is optional
        ]);

        if (ordersResponse.success) {
          setOrders(ordersResponse.orders);
        }

        if (stationsResponse.success) {
          setStations(stationsResponse.stations);
        }

        if (configResponse.success && configResponse.config) {
          setConfig(configResponse.config);
        }

      } catch (error) {
        console.error('Failed to load KDS data:', error);
        setError('Failed to load kitchen data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [setOrders, setStations, setConfig]);

  // Refresh orders every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const response = await ordersApi.getAll();
        if (response.success) {
          setOrders(response.orders);
        }
      } catch (error) {
        console.error('Failed to refresh orders:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [setOrders]);

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

  // Filter stations based on selection
  const activeStations = stations.filter(station => 
    station.active && selectedStations.includes(station.code)
  );

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
      <ProfessionalKDSHeader 
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