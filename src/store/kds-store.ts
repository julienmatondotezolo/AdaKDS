'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Order, Station, DisplayConfig, KDSStore } from '@/types';

export const useKDSStore = create<KDSStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    orders: [],
    stations: [],
    config: null,
    isConnected: false,
    selectedStations: [],
    currentTime: new Date(),

    // Actions
    setOrders: (orders: Order[]) => {
      set({ orders });
    },

    updateOrder: (orderId: string, updates: Partial<Order>) => {
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, ...updates } : order
        ),
      }));
    },

    addOrder: (order: Order) => {
      set((state) => ({
        orders: [...state.orders, order],
      }));
    },

    removeOrder: (orderId: string) => {
      set((state) => ({
        orders: state.orders.filter((order) => order.id !== orderId),
      }));
    },

    setStations: (stations: Station[]) => {
      set({ stations });
      
      // Auto-select all active stations if none are selected
      const currentSelected = get().selectedStations;
      if (currentSelected.length === 0) {
        const activeStationCodes = stations
          .filter(s => s.active)
          .map(s => s.code);
        set({ selectedStations: activeStationCodes });
      }
    },

    setConfig: (config: DisplayConfig) => {
      set({ config });
    },

    setConnected: (connected: boolean) => {
      set({ isConnected: connected });
    },

    setSelectedStations: (stations: string[]) => {
      set({ selectedStations: stations });
    },

    bumpOrder: (orderId: string) => {
      const order = get().orders.find(o => o.id === orderId);
      if (!order) return;

      // Status progression
      const statusProgression = {
        new: 'preparing',
        preparing: 'ready',
        ready: 'completed'
      } as const;

      const newStatus = statusProgression[order.status as keyof typeof statusProgression];
      
      if (newStatus) {
        get().updateOrder(orderId, { 
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
    },

    markOrderCompleted: (orderId: string) => {
      get().updateOrder(orderId, { 
        status: 'completed',
        updated_at: new Date().toISOString()
      });
    },
  }))
);

// Selectors for computed state
export const useFilteredOrders = () => {
  return useKDSStore((state) => {
    const { orders, selectedStations, config } = state;
    
    let filtered = orders;

    // Filter by selected stations
    if (selectedStations.length > 0) {
      filtered = filtered.filter(order => 
        selectedStations.includes(order.station)
      );
    }

    // Apply display filters
    if (config?.filters) {
      if (config.filters.hide_completed) {
        filtered = filtered.filter(order => order.status !== 'completed');
      }
      if (config.filters.hide_cancelled) {
        filtered = filtered.filter(order => order.status !== 'cancelled');
      }
    }

    return filtered;
  });
};

export const useOrdersByStation = () => {
  return useKDSStore((state) => {
    const { orders, selectedStations, config } = state;
    
    // Filter orders inline instead of using the other selector
    let filteredOrders = orders;

    // Filter by selected stations
    if (selectedStations.length > 0) {
      filteredOrders = filteredOrders.filter(order => 
        selectedStations.includes(order.station)
      );
    }

    // Apply display filters
    if (config?.filters) {
      if (config.filters.hide_completed) {
        filteredOrders = filteredOrders.filter(order => order.status !== 'completed');
      }
      if (config.filters.hide_cancelled) {
        filteredOrders = filteredOrders.filter(order => order.status !== 'cancelled');
      }
    }

    const { stations } = state;
    
    const ordersByStation: Record<string, Order[]> = {};
    
    // Initialize with empty arrays for all stations
    stations.forEach(station => {
      ordersByStation[station.code] = [];
    });
    
    // Group orders by station
    filteredOrders.forEach(order => {
      if (ordersByStation[order.station]) {
        ordersByStation[order.station].push(order);
      }
    });
    
    // Sort orders within each station
    Object.keys(ordersByStation).forEach(stationCode => {
      ordersByStation[stationCode].sort((a, b) => {
        // First by status priority (new < preparing < ready)
        const statusPriority = { new: 1, preparing: 2, ready: 3, completed: 4 };
        const statusDiff = (statusPriority[a.status as keyof typeof statusPriority] || 0) - 
                          (statusPriority[b.status as keyof typeof statusPriority] || 0);
        
        if (statusDiff !== 0) return statusDiff;
        
        // Then by order priority (urgent > high > normal > low)
        const priorityOrder = { urgent: 1, high: 2, normal: 3, low: 4 };
        const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Finally by order time (oldest first)
        return new Date(a.order_time).getTime() - new Date(b.order_time).getTime();
      });
    });
    
    return ordersByStation;
  });
};

export const useKitchenMetrics = () => {
  return useKDSStore((state) => {
    const { orders } = state;
    
    const total = orders.length;
    const byStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const overdue = orders.filter(order => {
      if (order.status === 'completed' || order.status === 'cancelled') return false;
      const now = new Date().getTime();
      const estimated = new Date(order.estimated_ready_time).getTime();
      return now > estimated;
    }).length;
    
    const avgPrepTime = orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.total_prep_time, 0) / orders.length 
      : 0;
    
    return {
      total,
      new: byStatus.new || 0,
      preparing: byStatus.preparing || 0,
      ready: byStatus.ready || 0,
      completed: byStatus.completed || 0,
      overdue,
      avgPrepTime: Math.round(avgPrepTime * 10) / 10
    };
  });
};

// Update current time every second
if (typeof window !== 'undefined') {
  setInterval(() => {
    useKDSStore.getState().currentTime = new Date();
  }, 1000);
}