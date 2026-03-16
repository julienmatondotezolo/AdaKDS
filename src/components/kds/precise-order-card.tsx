'use client';

import React from 'react';
import { Play, Pause, Check, Utensils, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

interface PreciseOrderCardProps {
  order: Order;
  status: 'NEW' | 'PROCESS' | 'READY' | 'SERVED';
  onStartOrder?: (orderId: string) => void;
  onPauseOrder?: (orderId: string) => void;
  onFinishOrder?: (orderId: string) => void;
  onServeOrder?: (orderId: string) => void;
}

export const PreciseOrderCard: React.FC<PreciseOrderCardProps> = ({ 
  order, 
  status,
  onStartOrder,
  onPauseOrder, 
  onFinishOrder,
  onServeOrder
}) => {
  // Calculate elapsed time
  const getElapsedTime = () => {
    if (!order.created_at) return '00:00';
    const now = new Date();
    const created = new Date(order.created_at);
    const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    const minutes = diff % 60;
    const hours = Math.floor(diff / 60);
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `${minutes.toString().padStart(2, '0')}:00`;
  };

  // Get display order ID
  const getOrderId = () => {
    return order.order_number || `#ADA${order.id?.slice(-6).toUpperCase()}` || '#ADA000000';
  };

  // Get customer display name
  const getCustomerName = () => {
    if (order.customer_type === 'dine_in') {
      return order.customer_name || 'Table ?';
    }
    return order.customer_name || 'Guest';
  };

  // Get status display text
  const getStatusText = () => {
    // Use special instructions if available, otherwise default text
    if (order.special_instructions) {
      return order.special_instructions;
    }
    
    switch (status) {
      case 'NEW': return 'NEW ORDER';
      case 'PROCESS': return 'IN PROCESS';
      case 'READY': return 'READY TO SERVE';
      case 'SERVED': return 'SERVED';
      default: return 'UNKNOWN';
    }
  };

  // Handle button actions
  const handlePrimaryAction = () => {
    if (status === 'NEW' && onStartOrder) {
      onStartOrder(order.id);
    } else if (status === 'PROCESS' && onFinishOrder) {
      onFinishOrder(order.id);
    } else if (status === 'READY' && onServeOrder) {
      onServeOrder(order.id);
    }
  };

  const handleSecondaryAction = () => {
    if (status === 'PROCESS' && onPauseOrder) {
      onPauseOrder(order.id);
    }
  };

  // Timer ring component
  const TimerRing: React.FC<{ time: string; color: string }> = ({ time, color }) => (
    <div className={cn(
      'w-16 h-16 rounded-full border-4 flex items-center justify-center relative',
      color === 'blue' && 'border-blue-200 bg-blue-50',
      color === 'orange' && 'border-orange-200 bg-orange-50',
      color === 'green' && 'border-green-200 bg-green-50'
    )}>
      <span className={cn(
        'text-xs font-bold',
        color === 'blue' && 'text-blue-600',
        color === 'orange' && 'text-orange-600',
        color === 'green' && 'text-green-600'
      )}>
        {time}
      </span>
    </div>
  );

  // Get timer color based on status and elapsed time
  const getTimerColor = () => {
    if (status === 'PROCESS') {
      const elapsed = parseInt(getElapsedTime().split(':')[0]) || 0;
      return elapsed > 8 ? 'orange' : 'blue';
    }
    return status === 'READY' ? 'green' : 'blue';
  };

  const elapsedTime = getElapsedTime();
  const orderId = getOrderId();
  const customerName = getCustomerName();
  const statusText = getStatusText();
  const timerColor = getTimerColor();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {customerName} - {statusText}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {orderId}
            </p>
          </div>
          
          {/* Timer Ring */}
          <TimerRing time={elapsedTime} color={timerColor} />
        </div>
      </div>

      {/* Items */}
      <div className="px-4 pb-3">
        <div className="space-y-2">
          {order.items?.length ? (
            order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.quantity}x {item.name}
                  </span>
                  {status === 'NEW' && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      New
                    </span>
                  )}
                  {status === 'READY' && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Ready
                    </span>
                  )}
                </div>
                {item.estimated_time && status === 'PROCESS' && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                    {item.estimated_time} mins
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 italic">No items</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4">
        {status === 'NEW' && (
          <button
            onClick={handlePrimaryAction}
            className="w-full flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        )}
        
        {status === 'PROCESS' && (
          <div className="flex gap-2">
            <button
              onClick={handleSecondaryAction}
              className="flex-1 flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
            <button
              onClick={handlePrimaryAction}
              className="flex-1 flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              Finish
            </button>
          </div>
        )}
        
        {status === 'READY' && (
          <button
            onClick={handlePrimaryAction}
            className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium text-sm transition-colors"
          >
            <Utensils className="w-4 h-4 text-gray-600" />
            Serve Order
          </button>
        )}
      </div>
    </div>
  );
};