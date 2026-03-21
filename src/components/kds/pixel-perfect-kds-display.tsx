'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { EnhancedOrderCard } from './enhanced-order-card';
import { useKDSStore } from '@/store/kds-store';
import { useSocket } from '@/hooks/use-socket';
import { createOrdersApi } from '@/lib/api';
import { useRestaurant } from '@/contexts/restaurant-context';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  Flame, 
  CheckCircle2, 
  Utensils,
  Play,
  Pause,
  Check,
  RotateCcw,
  Settings,
  RefreshCw
} from 'lucide-react';

export const PixelPerfectKDSDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

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

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        console.log('[KDS] Loading orders from API...');
        
        const ordersResponse = await ordersApi.getAll().catch(err => {
          console.error('[ORDERS] API error:', err);
          return []; 
        });

        // Handle different response formats - ONLY real API data
        if (Array.isArray(ordersResponse)) {
          stableSetOrders(ordersResponse);
        } else if (ordersResponse && typeof ordersResponse === 'object') {
          if ('success' in ordersResponse && ordersResponse.success && 'orders' in ordersResponse) {
            const orders = (ordersResponse as any).orders;
            stableSetOrders(orders);
          } else if ('data' in ordersResponse) {
            const data = (ordersResponse as any).data;
            stableSetOrders(data);
          } else {
            // Empty state - no fallback to mock data
            console.log('No orders found in database, showing empty state');
            stableSetOrders([]);
          }
        } else {
          // Empty state - no fallback to mock data
          console.log('No orders found in database, showing empty state');
          stableSetOrders([]);
        }

      } catch (error) {
        console.error('Failed to load KDS data:', error);
        stableSetOrders([]); // Show empty state on error, no mock fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [stableSetOrders]);

  // Format time as HH:MM:SS
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Format date as "Day, Mon DD"
  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dayNum = date.getDate();
    
    return `${day}, ${month} ${dayNum}`;
  };

  // Action handlers
  const handleStartOrder = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, 'preparing');
    } catch (error) {
      console.error('Failed to start order:', error);
    }
  };

  const handlePauseOrder = async (orderId: string) => {
    try {
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

  // Group orders by status
  const ordersByStatus = orders.reduce((acc, order) => {
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
        status = 'NEW';
    }
    
    if (!acc[status]) acc[status] = [];
    acc[status].push(order);
    return acc;
  }, {} as Record<string, any[]>);

  // Get REAL order counts - no fake numbers
  const newCount = ordersByStatus['NEW']?.length || 0;
  const processCount = ordersByStatus['PROCESS']?.length || 0;
  const readyCount = ordersByStatus['READY']?.length || 0;
  const servedCount = ordersByStatus['SERVED']?.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ada KDS</h2>
          <p className="text-gray-600 text-xl">Loading Kitchen Display...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Ada KDS</span>
          </div>

          {/* Right: Status, Clock, and Icons */}
          <div className="flex items-center gap-6">
            {/* LIVE Status */}
            <div className="flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">LIVE</span>
            </div>

            {/* Digital Clock */}
            <div className="text-gray-600 font-mono">
              <span className="text-lg">{formatTime(currentTime)} {formatDate(currentTime)}</span>
            </div>

            {/* Settings and Refresh Icons */}
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
              <RefreshCw className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      {/* Global Status Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-4 gap-6">
          {/* New Orders Card */}
          <div className="bg-white rounded-2xl border-t-4 border-t-[#3B82F6] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-semibold text-gray-900">New</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">{newCount}</span>
            </div>
          </div>

          {/* Process Orders Card */}
          <div className="bg-white rounded-2xl border-t-4 border-t-[#F97316] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-semibold text-gray-900">Process</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">{processCount}</span>
            </div>
          </div>

          {/* Ready Orders Card */}
          <div className="bg-white rounded-2xl border-t-4 border-t-[#3B82F6] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-semibold text-gray-900">Ready</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">{readyCount}</span>
            </div>
          </div>

          {/* Served Orders Card */}
          <div className="bg-white rounded-2xl border-t-4 border-t-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Utensils className="w-6 h-6 text-gray-600" />
                <span className="text-lg font-semibold text-gray-900">Served</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">{servedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Kanban Board */}
      <div className="px-6 pb-24">
        <div className="grid grid-cols-4 gap-6">
          {/* Column 1: New */}
          <div className="bg-white rounded-2xl border border-gray-200 min-h-[600px]">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">New</h3>
            </div>
            <div className="p-4">
              {ordersByStatus['NEW']?.length === 0 ? (
                <div className="text-center text-gray-400 mt-32">
                  <Bell className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">No new orders</p>
                  <p className="text-sm text-gray-400 mt-2">New orders will appear here</p>
                </div>
              ) : (
                ordersByStatus['NEW']?.map((order) => (
                  <EnhancedOrderCard
                    key={order.id}
                    order={order}
                    status="NEW"
                    onStartOrder={handleStartOrder}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 2: Process */}
          <div className="bg-white rounded-2xl border border-gray-200 min-h-[600px]">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Process</h3>
            </div>
            <div className="p-4 space-y-4">
              {ordersByStatus['PROCESS']?.length === 0 ? (
                <div className="text-center text-gray-400 mt-32">
                  <Flame className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">No orders in process</p>
                  <p className="text-sm text-gray-400 mt-2">Orders being prepared will appear here</p>
                </div>
              ) : (
                ordersByStatus['PROCESS']?.map((order) => (
                  <EnhancedOrderCard
                    key={order.id}
                    order={order}
                    status="PROCESS"
                    onPauseOrder={handlePauseOrder}
                    onFinishOrder={handleFinishOrder}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 3: Ready */}
          <div className="bg-white rounded-2xl border border-gray-200 min-h-[600px]">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Ready</h3>
            </div>
            <div className="p-4">
              {ordersByStatus['READY']?.length === 0 ? (
                <div className="text-center text-gray-400 mt-32">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">No orders ready</p>
                  <p className="text-sm text-gray-400 mt-2">Ready orders will appear here</p>
                </div>
              ) : (
                ordersByStatus['READY']?.map((order) => (
                  <EnhancedOrderCard
                    key={order.id}
                    order={order}
                    status="READY"
                    onServeOrder={handleServeOrder}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 4: Served */}
          <div className="bg-white rounded-2xl border border-gray-200 min-h-[600px]">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Served</h3>
            </div>
            <div className="p-4">
              <div className="text-center text-gray-400 mt-32">
                <Utensils className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                <p className="text-lg font-medium text-gray-500">No orders served yet</p>
                <p className="text-sm text-gray-400 mt-2">Completed orders will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Undo Last Action */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <button className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 border border-gray-200 transition-all duration-200 hover:shadow-xl">
          <RotateCcw className="w-4 h-4 text-gray-500" />
          Undo Last Action
        </button>
      </div>
    </div>
  );
};