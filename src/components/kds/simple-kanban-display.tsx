'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SimpleOrderCard } from './simple-order-card';
import { SimpleKanbanHeader } from './simple-kanban-header';
import { useKDSStore } from '@/store/kds-store';
import { useSocket } from '@/hooks/use-socket';
import { ordersApi } from '@/lib/api';
import { mockOrders } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

export const SimpleKanbanDisplay: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    orders, 
    setOrders, 
    bumpOrder: storeBumpOrder,
    markOrderCompleted
  } = useKDSStore();
  
  const { isConnected } = useSocket();

  // Create stable callbacks to avoid useEffect dependency issues
  const stableSetOrders = useCallback(setOrders, [setOrders]);
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setError(null);
        setIsLoading(true);

        console.log('[Simple Kanban] Loading orders...');
        
        // Use mock data in development, real API in production
        if (process.env.NODE_ENV === 'development') {
          console.log('[Simple Kanban] Using mock data for development');
          stableSetOrders(mockOrders);
        } else {
          const ordersResponse = await ordersApi.getAll().catch(err => {
            console.error('[ORDERS] API error:', err);
            return [];
          });

          // Handle orders response format
          if (Array.isArray(ordersResponse)) {
            stableSetOrders(ordersResponse);
          } else if (ordersResponse?.success && ordersResponse?.orders) {
            stableSetOrders(ordersResponse.orders);
          } else {
            console.error('Unexpected orders response format:', ordersResponse);
            stableSetOrders([]);
          }
        }

      } catch (error) {
        console.error('Failed to load orders:', error);
        setError('Failed to load orders. Please refresh the page.');
        stableSetOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [stableSetOrders]);

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

  // Organize orders by status for kanban columns
  const ordersByStatus = {
    new: orders.filter(order => order.status === 'new'),
    process: orders.filter(order => order.status === 'preparing'),
    ready: orders.filter(order => order.status === 'ready')
  };

  // Handle order actions
  const handleStartOrder = async (orderId: string) => {
    try {
      // Optimistic update
      storeBumpOrder(orderId);
      
      // API call
      await ordersApi.bump(orderId);
    } catch (error) {
      console.error('Failed to start order:', error);
    }
  };

  const handlePauseOrder = async (orderId: string) => {
    try {
      // For now, pause just updates the order back to new status
      // In a real system, you might have a "paused" status
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await ordersApi.updateStatus(orderId, 'new');
      }
    } catch (error) {
      console.error('Failed to pause order:', error);
    }
  };

  const handleFinishOrder = async (orderId: string) => {
    try {
      // Optimistic update
      storeBumpOrder(orderId);
      
      // API call
      await ordersApi.bump(orderId);
    } catch (error) {
      console.error('Failed to finish order:', error);
    }
  };

  const handlePrintOrder = async (orderId: string) => {
    try {
      console.log(`[PRINT] Order ${orderId}`);
      // In a real system, this would send the order to a printer
      window.print(); // Simple browser print for now
    } catch (error) {
      console.error('Failed to print order:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-2">Loading Kitchen Display</h2>
          <p className="text-gray-400 text-lg">Fetching orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-400 text-3xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header with counts */}
      <SimpleKanbanHeader 
        newCount={ordersByStatus.new.length}
        processCount={ordersByStatus.process.length}
        readyCount={ordersByStatus.ready.length}
        isConnected={isConnected}
      />

      {/* Main Kanban Board */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {/* New Orders Column */}
          <div className="flex flex-col">
            <div className="text-white text-center py-4 rounded-t-lg mb-4" style={{ backgroundColor: '#EF4444' }}>
              <h2 className="text-xl font-bold">New ({ordersByStatus.new.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {ordersByStatus.new.map((order) => (
                <SimpleOrderCard
                  key={order.id}
                  order={order}
                  type="new"
                  onStart={() => handleStartOrder(order.id)}
                  onFinish={() => handleFinishOrder(order.id)}
                />
              ))}
            </div>
          </div>

          {/* Processing Orders Column */}
          <div className="flex flex-col">
            <div className="text-white text-center py-4 rounded-t-lg mb-4" style={{ backgroundColor: '#F59E0B' }}>
              <h2 className="text-xl font-bold">Process ({ordersByStatus.process.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {ordersByStatus.process.map((order) => (
                <SimpleOrderCard
                  key={order.id}
                  order={order}
                  type="process"
                  onPause={() => handlePauseOrder(order.id)}
                  onFinish={() => handleFinishOrder(order.id)}
                />
              ))}
            </div>
          </div>

          {/* Ready Orders Column */}
          <div className="flex flex-col">
            <div className="text-white text-center py-4 rounded-t-lg mb-4" style={{ backgroundColor: '#10B981' }}>
              <h2 className="text-xl font-bold">Ready ({ordersByStatus.ready.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {ordersByStatus.ready.map((order) => (
                <SimpleOrderCard
                  key={order.id}
                  order={order}
                  type="ready"
                  onPrint={() => handlePrintOrder(order.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};