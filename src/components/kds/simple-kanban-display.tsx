'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SimpleOrderCard } from './simple-order-card';
import { SimpleKanbanHeader } from './simple-kanban-header';
import { useKDSStore } from '@/store/kds-store';
import { useSocket } from '@/hooks/use-socket';
import { ordersApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { CheckCircle, UtensilsCrossed, ChefHat, Clock } from 'lucide-react';
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

        console.log('[Simple Kanban] Loading orders from API...');
        
        // Always use real API - no more dummy data
        const ordersResponse = await ordersApi.getAll().catch(err => {
          console.error('[ORDERS] API error:', err);
          return { success: false, orders: [] };
        });

        // Handle orders response format
        if (Array.isArray(ordersResponse)) {
          stableSetOrders(ordersResponse);
        } else if (ordersResponse?.success && ordersResponse?.orders) {
          stableSetOrders(ordersResponse.orders);
        } else {
          console.log('[Simple Kanban] No orders available or API error, showing empty state');
          stableSetOrders([]);
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

  // Organize orders by status for kanban columns (exclude completed orders)
  const activeOrders = orders.filter(order => order.status !== 'completed' && order.status !== 'cancelled');
  const ordersByStatus = {
    new: activeOrders.filter(order => order.status === 'new'),
    process: activeOrders.filter(order => order.status === 'preparing'),
    ready: activeOrders.filter(order => order.status === 'ready')
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

  const handleCompleteOrder = async (orderId: string, completionType: 'served' | 'pickup' | 'delivery') => {
    try {
      console.log(`[COMPLETE] Order ${orderId} marked as ${completionType}`);
      
      // Mark order as completed - this will remove it from display
      markOrderCompleted(orderId);
      
      // API call to update status
      await ordersApi.updateStatus(orderId, 'completed');
      
      console.log(`[SUCCESS] Order ${orderId} completed successfully`);
    } catch (error) {
      console.error(`Failed to complete order ${orderId}:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ada-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Loading Kitchen Display</h2>
          <p className="text-gray-600 text-lg">Fetching orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-3xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-ada-600 hover:bg-ada-700 text-white px-8 py-4 rounded-lg font-semibold"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Check if there are any active orders at all
  const totalActiveOrders = ordersByStatus.new.length + ordersByStatus.process.length + ordersByStatus.ready.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header with counts */}
      <SimpleKanbanHeader 
        newCount={ordersByStatus.new.length}
        processCount={ordersByStatus.process.length}
        readyCount={ordersByStatus.ready.length}
        isConnected={isConnected}
      />

      {/* Global Empty State */}
      {totalActiveOrders === 0 && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-32 h-32 bg-green-100 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600 w-16 h-16" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Caught Up!</h2>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              No orders in the kitchen right now. New orders will appear here automatically when they come in.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className={cn(
                "w-3 h-3 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )}></div>
              <span className={isConnected ? "text-green-700" : "text-red-700"}>
                {isConnected ? "Connected to kitchen system" : "Disconnected from kitchen system"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Kanban Board */}
      {totalActiveOrders > 0 && (
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[calc(100vh-120px)]">
          {/* New Orders Column */}
          <div className="flex flex-col min-h-[500px]">
            <div className="text-white text-center py-4 rounded-lg mb-4 shadow-sm" style={{ backgroundColor: '#EF4444' }}>
              <h2 className="text-xl font-bold">New ({ordersByStatus.new.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[calc(100vh-200px)] custom-scrollbar touch-scroll">
              {ordersByStatus.new.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-semibold">No new orders</p>
                  <p className="text-sm">New orders will appear here</p>
                </div>
              ) : (
                ordersByStatus.new.map((order) => (
                  <SimpleOrderCard
                    key={order.id}
                    order={order}
                    type="new"
                    onStart={() => handleStartOrder(order.id)}
                    onFinish={() => handleFinishOrder(order.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Processing Orders Column */}
          <div className="flex flex-col min-h-[500px]">
            <div className="text-white text-center py-4 rounded-lg mb-4 shadow-sm" style={{ backgroundColor: '#F59E0B' }}>
              <h2 className="text-xl font-bold">Process ({ordersByStatus.process.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[calc(100vh-200px)] custom-scrollbar touch-scroll">
              {ordersByStatus.process.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ChefHat className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-semibold">No orders in progress</p>
                  <p className="text-sm">Orders being prepared will appear here</p>
                </div>
              ) : (
                ordersByStatus.process.map((order) => (
                  <SimpleOrderCard
                    key={order.id}
                    order={order}
                    type="process"
                    onPause={() => handlePauseOrder(order.id)}
                    onFinish={() => handleFinishOrder(order.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Ready Orders Column */}
          <div className="flex flex-col min-h-[500px]">
            <div className="text-white text-center py-4 rounded-lg mb-4 shadow-sm" style={{ backgroundColor: '#10B981' }}>
              <h2 className="text-xl font-bold">Ready ({ordersByStatus.ready.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[calc(100vh-200px)] custom-scrollbar touch-scroll">
              {ordersByStatus.ready.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-semibold">No orders ready</p>
                  <p className="text-sm">Orders will appear here when ready for completion</p>
                </div>
              ) : (
                ordersByStatus.ready.map((order) => (
                  <SimpleOrderCard
                    key={order.id}
                    order={order}
                    type="ready"
                    onComplete={(type) => handleCompleteOrder(order.id, type)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};