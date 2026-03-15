'use client';

import React from 'react';
import { ChefHat, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModernOrderCard } from './modern-order-card';
import type { Order, Station } from '@/types';

interface ModernStationColumnProps {
  station: Station;
  orders: Order[];
  onBumpOrder: (orderId: string) => void;
  onCompleteOrder: (orderId: string) => void;
  maxOrdersPerColumn?: number;
}

export const ModernStationColumn: React.FC<ModernStationColumnProps> = ({
  station,
  orders,
  onBumpOrder,
  onCompleteOrder,
  maxOrdersPerColumn = 8
}) => {
  // Calculate station metrics
  const stationMetrics = {
    total: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    overdue: orders.filter(o => {
      const elapsedMinutes = o.elapsed_time / 60;
      const expectedTime = o.total_prep_time;
      return elapsedMinutes > expectedTime * 1.2; // 20% over expected time
    }).length,
    avgTime: orders.length > 0 
      ? Math.round(orders.reduce((sum, o) => sum + o.elapsed_time, 0) / orders.length / 60)
      : 0
  };

  // Sort orders by priority and elapsed time
  const sortedOrders = [...orders].sort((a, b) => {
    // Priority sorting
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
    const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
    if (priorityDiff !== 0) return priorityDiff;

    // Status sorting (ready first, then by elapsed time)
    if (a.status === 'ready' && b.status !== 'ready') return -1;
    if (b.status === 'ready' && a.status !== 'ready') return 1;

    // Elapsed time sorting (longest first)
    return b.elapsed_time - a.elapsed_time;
  });

  // Station color mapping
  const getStationColors = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hot kitchen':
      case 'hot':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-400',
          icon: '🔥'
        };
      case 'cold prep':
      case 'cold':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          text: 'text-blue-400',
          icon: '❄️'
        };
      case 'grill':
        return {
          bg: 'bg-orange-500/20',
          border: 'border-orange-500/50',
          text: 'text-orange-400',
          icon: '🔥'
        };
      case 'bar':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/50',
          text: 'text-green-400',
          icon: '🍹'
        };
      case 'dessert':
        return {
          bg: 'bg-purple-500/20',
          border: 'border-purple-500/50',
          text: 'text-purple-400',
          icon: '🍰'
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
          icon: '🍽️'
        };
    }
  };

  const stationColors = getStationColors(station.name);

  return (
    <div className="station-column">
      {/* Station Header */}
      <div className={cn(
        'station-header border-b-4 p-6',
        stationColors.bg,
        stationColors.border
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center border-2',
              stationColors.bg,
              stationColors.border
            )}>
              <ChefHat className={cn('h-6 w-6', stationColors.text)} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase">
                {station.name}
              </h2>
              <p className="text-gray-400 font-medium">
                Station {station.display_order}
              </p>
            </div>
          </div>

          {/* Station Status */}
          <div className="text-right">
            <div className="text-3xl font-black text-white">
              {stationMetrics.total}
            </div>
            <div className="text-gray-400 font-bold">
              Orders
            </div>
          </div>
        </div>

        {/* Station Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {stationMetrics.new}
            </div>
            <div className="text-xs text-gray-400 font-medium uppercase">
              New
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {stationMetrics.preparing}
            </div>
            <div className="text-xs text-gray-400 font-medium uppercase">
              Preparing
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {stationMetrics.ready}
            </div>
            <div className="text-xs text-gray-400 font-medium uppercase">
              Ready
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {stationMetrics.avgTime}m
            </div>
            <div className="text-xs text-gray-400 font-medium uppercase">
              Avg
            </div>
          </div>
        </div>

        {/* Overdue Alert */}
        {stationMetrics.overdue > 0 && (
          <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400 animate-bounce" />
              <span className="text-red-400 font-bold">
                {stationMetrics.overdue} orders overdue - Action needed!
              </span>
            </div>
          </div>
        )}

        {/* Performance Indicator */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">Performance tracking</span>
          </div>
          <div className={cn('font-bold', {
            'text-green-400': stationMetrics.avgTime <= 15,
            'text-amber-400': stationMetrics.avgTime <= 20,
            'text-red-400': stationMetrics.avgTime > 20
          })}>
            {stationMetrics.avgTime <= 15 ? 'Excellent' : 
             stationMetrics.avgTime <= 20 ? 'Good' : 'Needs Attention'}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-hidden">
        {sortedOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center border-2 mx-auto mb-4',
                stationColors.bg,
                stationColors.border
              )}>
                <ChefHat className={cn('h-10 w-10', stationColors.text)} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
              <p className="text-gray-400">No orders for this station</p>
            </div>
          </div>
        ) : (
          <div className="order-grid">
            {sortedOrders.slice(0, maxOrdersPerColumn).map((order) => (
              <ModernOrderCard
                key={order.id}
                order={order}
                onBump={onBumpOrder}
                onComplete={onCompleteOrder}
              />
            ))}
            
            {/* Overflow Indicator */}
            {sortedOrders.length > maxOrdersPerColumn && (
              <div className="bg-gray-700 border border-gray-600 rounded-xl p-4 text-center">
                <div className="text-amber-400 font-bold text-lg">
                  +{sortedOrders.length - maxOrdersPerColumn} More Orders
                </div>
                <div className="text-gray-400 text-sm">
                  Scroll or adjust layout to view all orders
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Station Footer */}
      <div className="border-t border-gray-700 p-4 bg-gray-800/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Last updated: just now</span>
          </div>
          <div className="text-gray-400">
            Capacity: <span className={cn('font-bold', {
              'text-green-400': stationMetrics.total <= maxOrdersPerColumn * 0.7,
              'text-amber-400': stationMetrics.total <= maxOrdersPerColumn * 0.9,
              'text-red-400': stationMetrics.total > maxOrdersPerColumn * 0.9
            })}>
              {stationMetrics.total}/{maxOrdersPerColumn}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};