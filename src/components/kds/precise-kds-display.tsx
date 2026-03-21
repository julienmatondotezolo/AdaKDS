'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PreciseKDSHeader } from './precise-kds-header';
import { GlobalStatusCards } from './global-status-cards';
import { PreciseOrderCard } from './precise-order-card';
import { useKDSStore } from '@/store/kds-store';
import { useSocket } from '@/hooks/use-socket';
import { createOrdersApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { useRestaurant } from '@/contexts/restaurant-context';
import { cn } from '@/lib/utils';
import { RotateCcw, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface KanbanColumn {
  id: string;
  title: string;
  status: 'NEW' | 'PROCESS' | 'READY' | 'SERVED';
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'new', title: 'New', status: 'NEW' },
  { id: 'process', title: 'Process', status: 'PROCESS' },
  { id: 'ready', title: 'Ready', status: 'READY' },
  { id: 'served', title: 'Served', status: 'SERVED' },
];

export const PreciseKDSDisplay: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    orders,
    setOrders, 
    bumpOrder,
    markOrderCompleted
  } = useKDSStore();
  
  const { isConnected } = useSocket();
  const { isAdmin, isOwner } = useAuth();
  const { restaurantId } = useRestaurant();
  const router = useRouter();
  const ordersApi = createOrdersApi(restaurantId!);

  const stableSetOrders = useCallback(setOrders, [setOrders]);
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setError(null);
        setIsLoading(true);
        console.log('[KDS] Loading orders...');
        
        const ordersResponse = await ordersApi.getAll().catch(err => {
          console.error('[ORDERS] API error:', err);
          return []; // Return empty array on error
        });

        // Handle orders response format
        if (Array.isArray(ordersResponse)) {
          console.log('Setting orders:', ordersResponse.length, 'orders');
          stableSetOrders(ordersResponse);
        } else if (ordersResponse && typeof ordersResponse === 'object') {
          if ('success' in ordersResponse && ordersResponse.success && 'orders' in ordersResponse) {
            const orders = (ordersResponse as any).orders;
            console.log('Setting orders (wrapped):', orders.length, 'orders');
            stableSetOrders(orders);
          } else if ('data' in ordersResponse) {
            const data = (ordersResponse as any).data;
            console.log('Setting orders (data prop):', data.length, 'orders');
            stableSetOrders(data);
          } else {
            console.log('No orders found, setting empty array');
            stableSetOrders([]);
          }
        } else {
          console.log('No orders found, setting empty array');
          stableSetOrders([]);
        }

      } catch (error) {
        console.error('Failed to load KDS data:', error);
        setError('Failed to load kitchen data. Please refresh the page.');
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
        // Handle both array and wrapped response formats
        if (Array.isArray(response)) {
          stableSetOrders(response);
        } else if (response && typeof response === 'object') {
          if ('success' in response && response.success && 'orders' in response) {
            stableSetOrders((response as any).orders);
          } else if ('data' in response) {
            stableSetOrders((response as any).data);
          }
        }
      } catch (error) {
        console.error('Failed to refresh orders:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [stableSetOrders]);

  const handleStartOrder = async (orderId: string) => {
    try {
      bumpOrder(orderId);
      await ordersApi.updateStatus(orderId, 'preparing');
    } catch (error) {
      console.error('Failed to start order:', error);
    }
  };

  const handlePauseOrder = async (orderId: string) => {
    try {
      // Pause functionality - could update a pause flag
      await ordersApi.updateStatus(orderId, 'preparing');
    } catch (error) {
      console.error('Failed to pause order:', error);
    }
  };

  const handleFinishOrder = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, 'ready');
    } catch (error) {
      console.error('Failed to finish order:', error);
    }
  };

  const handleServeOrder = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, 'completed');
    } catch (error) {
      console.error('Failed to serve order:', error);
    }
  };

  const handleUndoLastAction = () => {
    // TODO: Implement undo functionality
    console.log('Undo last action');
  };

  // Group orders by status with proper mapping
  const ordersByStatus = orders.reduce((acc, order) => {
    // Map backend status to frontend columns
    let status: 'NEW' | 'PROCESS' | 'READY' | 'SERVED';
    
    switch (order.status?.toLowerCase()) {
      case 'new':
      case 'created':
        status = 'NEW';
        break;
      case 'preparing':
        status = 'PROCESS';
        break;
      case 'ready':
        status = 'READY';
        break;
      case 'completed':
        status = 'SERVED';
        break;
      default:
        status = 'NEW'; // fallback
    }
    
    if (!acc[status]) acc[status] = [];
    acc[status].push(order);
    return acc;
  }, {} as Record<string, any[]>);

  // Get order counts for each status
  const getStatusCount = (status: string) => ordersByStatus[status]?.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Loading Kitchen Display</h2>
          <p className="text-gray-600 text-lg">Fetching orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <RotateCcw className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 text-lg mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Precise Header */}
      <PreciseKDSHeader isConnected={isConnected} />

      {/* Connection Status Warning */}
      {!isConnected && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
          WARNING: Disconnected from server - Orders may not update in real-time
        </div>
      )}

      {/* Settings Icon (Admin/Owner Only) */}
      {(isAdmin || isOwner) && (
        <div className="fixed top-20 right-6 z-50">
          <button
            onClick={() => router.push('/admin')}
            className="bg-white border border-gray-300 text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 group"
            title="Open Admin Panel"
          >
            <Settings className="w-6 h-6 text-gray-600 group-hover:text-gray-800" />
          </button>
        </div>
      )}

      {/* Global Status Cards */}
      <GlobalStatusCards
        newCount={getStatusCount('NEW')}
        processCount={getStatusCount('PROCESS')}
        readyCount={getStatusCount('READY')}
        servedCount={getStatusCount('SERVED')}
      />

      {/* Four Column Kanban Layout */}
      <div className="px-6 pb-20">
        <div className="grid grid-cols-4 gap-6">
          {KANBAN_COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-600 flex items-center gap-2">
                  {column.title}
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-bold">
                    {getStatusCount(column.status)}
                  </span>
                </h2>
              </div>

              {/* Column Content */}
              <div className="space-y-4 min-h-[600px]">
                {ordersByStatus[column.status]?.length === 0 ? (
                  <div className="text-center text-gray-400 mt-20">
                    <p className="text-sm text-gray-500">
                      {column.status === 'NEW' ? 'No new orders' : 
                       column.status === 'PROCESS' ? 'No orders in process' :
                       column.status === 'READY' ? 'No orders ready' : 'No orders served'}
                    </p>
                  </div>
                ) : (
                  ordersByStatus[column.status]?.map((order) => (
                    <PreciseOrderCard
                      key={order.id}
                      order={order}
                      status={column.status}
                      onStartOrder={handleStartOrder}
                      onPauseOrder={handlePauseOrder}
                      onFinishOrder={handleFinishOrder}
                      onServeOrder={handleServeOrder}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Undo Last Action Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleUndoLastAction}
          className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-gray-500" />
          Undo Last Action
        </button>
      </div>
    </div>
  );
};