'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

interface SimpleOrderCardProps {
  order: Order;
  type: 'new' | 'process' | 'ready';
  onStart?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
  onPrint?: () => void;
}

export const SimpleOrderCard: React.FC<SimpleOrderCardProps> = ({
  order,
  type,
  onStart,
  onPause,
  onFinish,
  onPrint,
}) => {
  // Calculate elapsed time
  const orderTime = new Date(order.order_time);
  const now = new Date();
  const elapsedMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));

  // Format order time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get table number from customer info or generate one
  const getTableNumber = () => {
    // Try to extract table number from customer_name or use order number last digits
    if (order.customer_name && order.customer_name.includes('Table')) {
      return order.customer_name;
    }
    if (order.customer_type === 'dine_in') {
      return `Table ${order.order_number.slice(-2)}`;
    }
    if (order.customer_type === 'takeaway') {
      return 'Table 0';
    }
    if (order.customer_type === 'delivery') {
      return 'Table 0';
    }
    return `Table ${order.order_number.slice(-1)}`;
  };

  // Get status badge text
  const getStatusBadge = () => {
    switch (order.customer_type) {
      case 'dine_in':
        return 'Dine In';
      case 'takeaway':
        return 'Takeaway';
      case 'delivery':
        return 'Delivery';
      default:
        return 'Dine In';
    }
  };

  // Color scheme based on card type
  const colorScheme = {
    new: {
      headerBg: '#EF4444',
      border: 'border-red-400/20',
    },
    process: {
      headerBg: '#F59E0B',
      border: 'border-yellow-400/20',
    },
    ready: {
      headerBg: '#10B981',
      border: 'border-green-400/20',
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-lg overflow-hidden border-2",
      colorScheme[type].border
    )}>
      {/* Card Header */}
      <div 
        className="px-4 py-3 text-white flex justify-between items-center"
        style={{ backgroundColor: colorScheme[type].headerBg }}
      >
        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold">🍽️</span>
          <div className="flex flex-col">
            <span className="font-bold text-lg">{getTableNumber()}</span>
            <span className="text-sm opacity-90">Order #{order.order_number}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold">{formatTime(orderTime)}</span>
          <div className="bg-white/20 px-3 py-1 rounded-full">
            <span className="text-xs font-medium">{getStatusBadge()}</span>
          </div>
          {elapsedMinutes > 0 && (
            <span className="text-sm font-bold mt-1">
              {elapsedMinutes} min{elapsedMinutes !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="px-4 py-4">
        {/* Order Items */}
        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1">
                <span className="font-semibold text-gray-800 text-lg">
                  {item.quantity}x {item.name}
                </span>
                {item.special_requests && (
                  <p className="text-sm text-gray-500 italic ml-4">
                    • {item.special_requests}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          {type === 'new' && (
            <>
              <button
                onClick={onStart}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-lg"
              >
                Start
              </button>
              <button
                onClick={onFinish}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors text-lg"
              >
                Finish
              </button>
            </>
          )}
          
          {type === 'process' && (
            <>
              <button
                onClick={onPause}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors text-lg"
              >
                Pause
              </button>
              <button
                onClick={onFinish}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-lg"
              >
                Finish
              </button>
            </>
          )}
          
          {type === 'ready' && (
            <button
              onClick={onPrint}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors text-lg"
            >
              Print
            </button>
          )}
        </div>
      </div>
    </div>
  );
};