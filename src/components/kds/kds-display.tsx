'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { KDSHeader } from './kds-header';
import { PixelPerfectOrderCard } from './pixel-perfect-order-card';
import { useKDSStore } from '@/store/kds-store';
import { useSocket } from '@/hooks/use-socket';
import { createOrdersApi } from '@/lib/api';
import { useRestaurant } from '@/contexts/restaurant-context';
import { cn } from '@/lib/utils';
import { Bell, Flame, CheckCircle2, Utensils } from 'lucide-react';

interface KanbanColumn {
  id: string;
  title: string;
  status: 'NEW' | 'PROCESS' | 'READY' | 'SERVED';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'new',
    title: 'NEW',
    status: 'NEW',
    icon: <Bell className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'process', 
    title: 'PROCESS',
    status: 'PROCESS',
    icon: <Flame className="w-5 h-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    id: 'ready',
    title: 'READY', 
    status: 'READY',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'served',
    title: 'SERVED',
    status: 'SERVED', 
    icon: <Utensils className="w-5 h-5" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
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
  const { restaurantId } = useRestaurant();
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Loading Kitchen Display</h2>
          <p className="text-gray-600 text-lg">Fetching orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 text-lg mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <KDSHeader isConnected={isConnected} />

      {/* Connection Status Warning */}
      {!isConnected && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
          WARNING: Disconnected from server - Orders may not update in real-time
        </div>
      )}

      {/* Main 4-Column Layout with counts at top */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-6">
          {KANBAN_COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header with Count */}
              <div className={cn(
                "flex items-center justify-between p-4 rounded-t-lg border-b",
                column.bgColor,
                column.borderColor,
                "border bg-white"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", column.bgColor)}>
                    <span className={column.color}>{column.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{column.title}</h3>
                </div>
                <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xl font-bold min-w-[48px] text-center">
                  {getStatusCount(column.status)}
                </div>
              </div>

              {/* Column Content Area */}
              <div className="bg-white rounded-b-lg border-l border-r border-b border-gray-200 min-h-[600px] max-h-[700px] overflow-y-auto">
                <div className="p-3 space-y-3">
                  {ordersByStatus[column.status]?.length === 0 ? (
                    <div className="text-center text-gray-400 mt-20">
                      <div className={cn(
                        "w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center",
                        column.bgColor
                      )}>
                        <span className={column.color}>{column.icon}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {column.status === 'NEW' ? 'No new orders' : 
                         column.status === 'PROCESS' ? 'No orders in process' :
                         column.status === 'READY' ? 'No orders ready' : 'No orders served'}
                      </p>
                    </div>
                  ) : (
                    ordersByStatus[column.status]?.map((order) => (
                      <PixelPerfectOrderCard
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};