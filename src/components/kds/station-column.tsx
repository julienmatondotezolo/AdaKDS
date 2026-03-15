'use client';

import React from 'react';
import { cn, getStationColor } from '@/lib/utils';
import { EnhancedOrderCard } from './enhanced-order-card';
import type { Order, Station } from '@/types';

interface StationColumnProps {
  station: Station;
  orders: Order[];
  onBumpOrder: (orderId: string) => void;
  onCompleteOrder: (orderId: string) => void;
  maxOrdersPerColumn?: number;
}

export const StationColumn: React.FC<StationColumnProps> = ({
  station,
  orders,
  onBumpOrder,
  onCompleteOrder,
  maxOrdersPerColumn = 8
}) => {
  const loadPercentage = station.estimated_capacity > 0 
    ? Math.round((station.current_load / station.estimated_capacity) * 100)
    : 0;

  const getLoadColor = (percentage: number) => {
    if (percentage <= 60) return 'text-green-600';
    if (percentage <= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const visibleOrders = orders.slice(0, maxOrdersPerColumn);
  const hiddenCount = Math.max(0, orders.length - maxOrdersPerColumn);

  return (
    <div className="station-column">
      {/* Station Header */}
      <div 
        className="station-header"
        style={{ backgroundColor: `${station.color}15`, borderTopColor: station.color }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: station.color }}
            />
            <div>
              <h3 className="font-bold text-lg">{station.name}</h3>
              {station.description && (
                <p className="text-sm text-gray-600">{station.description}</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">
              {orders.length} orders
            </div>
            <div className={cn('text-xs font-medium', getLoadColor(loadPercentage))}>
              {station.current_load}/{station.estimated_capacity} capacity
            </div>
          </div>
        </div>
        
        {/* Capacity Bar */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={cn('h-1.5 rounded-full transition-all duration-300', {
                'bg-green-500': loadPercentage <= 60,
                'bg-yellow-500': loadPercentage > 60 && loadPercentage <= 80,
                'bg-red-500': loadPercentage > 80
              })}
              style={{ width: `${Math.min(loadPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="order-grid">
        {visibleOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-sm">No orders for {station.name}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleOrders.map((order) => (
              <EnhancedOrderCard
                key={order.id}
                order={order}
                onBump={onBumpOrder}
                onComplete={onCompleteOrder}
              />
            ))}
            
            {hiddenCount > 0 && (
              <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
                <div className="text-sm font-medium">
                  +{hiddenCount} more orders
                </div>
                <div className="text-xs mt-1">
                  Scroll down to view all orders
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Station Footer with Quick Stats */}
      <div className="mt-auto p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div className="flex gap-4">
            <span>New: {orders.filter(o => o.status === 'new').length}</span>
            <span>Preparing: {orders.filter(o => o.status === 'preparing').length}</span>
            <span>Ready: {orders.filter(o => o.status === 'ready').length}</span>
          </div>
          <div className="text-right">
            <div className={cn('font-medium', {
              'text-green-600': loadPercentage <= 60,
              'text-yellow-600': loadPercentage > 60 && loadPercentage <= 80,
              'text-red-600': loadPercentage > 80
            })}>
              {loadPercentage}% load
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};