'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { KDSHeader } from './kds-header';
import { ModernOrderCard } from './modern-order-card';
import { useKDSStore } from '@/store/kds-store';
import { useSocket } from '@/hooks/use-socket';
import { ordersApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Bell, Flame, CheckCircle2, X, RotateCcw } from 'lucide-react';

interface KanbanColumn {
  id: string;
  title: string;
  status: 'NEW' | 'PROCESS' | 'READY' | 'SERVED';
  icon: React.ReactNode;
  color: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'new',
    title: 'NEW',
    status: 'NEW',
    icon: <Bell className="w-5 h-5" />,
    color: 'text-blue-500'
  },
  {
    id: 'process', 
    title: 'PROCESS',
    status: 'PROCESS',
    icon: <Flame className="w-5 h-5" />,
    color: 'text-orange-500'
  },
  {
    id: 'ready',
    title: 'READY', 
    status: 'READY',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'text-green-500'
  },
  {
    id: 'served',
    title: 'SERVED',
    status: 'SERVED', 
    icon: <X className="w-5 h-5" />,
    color: 'text-gray-500'
  }
];

export const KDSDisplay: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    orders,
    setOrders, 
    bumpOrder,
    markOrderCompleted
  } = useKDSStore();
  
  const { isConnected } = useSocket();

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
      // Pause means stay in preparing status but with pause flag
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
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 text-lg mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-ada-500 text-white rounded-lg hover:bg-ada-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <KDSHeader isConnected={isConnected} />

      {/* Connection Status Warning */}
      {!isConnected && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
          WARNING: Disconnected from server - Orders may not update in real-time
        </div>
      )}

      {/* Status Overview Cards */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map((column) => (
            <div key={column.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-gray-100", column.color)}>
                    {column.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{column.title}</h3>
                </div>
                <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-2xl font-bold">
                  {getStatusCount(column.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="px-6 pb-20">
        <div className="grid grid-cols-4 gap-6 min-h-[600px]">
          {KANBAN_COLUMNS.map((column) => (
            <div key={column.id} className={cn(
              "bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-hidden",
              {
                'border-l-4 border-l-blue-500': column.status === 'NEW',
                'border-l-4 border-l-orange-500': column.status === 'PROCESS',
                'border-l-4 border-l-green-500': column.status === 'READY',
                'border-l-4 border-l-gray-400': column.status === 'SERVED'
              }
            )}>
              {/* Column Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 tracking-wide">{column.title}</span>
                    <span className="text-lg font-bold text-gray-900">
                      {getStatusCount(column.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column Content */}
              <div className="p-3 space-y-3 min-h-[500px] max-h-[600px] overflow-y-auto">
                {ordersByStatus[column.status]?.length === 0 ? (
                  <div className="text-center text-gray-400 mt-20">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 rounded-full flex items-center justify-center">
                      {column.icon}
                    </div>
                    <p className="text-xs text-gray-500">
                      {column.status === 'NEW' ? 'No new orders' : 
                       column.status === 'PROCESS' ? 'No orders in process' :
                       column.status === 'READY' ? 'No orders ready' : 'No orders served'}
                    </p>
                  </div>
                ) : (
                  ordersByStatus[column.status]?.map((order) => (
                    <ModernOrderCard
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

      {/* Undo Last Action Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleUndoLastAction}
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Undo Last Action
        </button>
      </div>
    </div>
  );
};