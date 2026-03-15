'use client';

import React from 'react';
import { Pause, Check, Play, Utensils, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

interface ModernOrderCardProps {
  order: Order;
  status: 'NEW' | 'PROCESS' | 'READY' | 'SERVED';
  onStartOrder?: (orderId: string) => void;
  onPauseOrder?: (orderId: string) => void;
  onFinishOrder?: (orderId: string) => void;
  onServeOrder?: (orderId: string) => void;
}

export const ModernOrderCard: React.FC<ModernOrderCardProps> = ({ 
  order, 
  status,
  onStartOrder,
  onPauseOrder, 
  onFinishOrder,
  onServeOrder
}) => {
  // Calculate elapsed time in minutes
  const getElapsedMinutes = () => {
    if (!order.created_at) return 0;
    const now = new Date();
    const created = new Date(order.created_at);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
  };

  // Get current time for display in circle
  const getCurrentTimeDisplay = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const elapsedMinutes = getElapsedMinutes();
  const currentTime = getCurrentTimeDisplay();

  // Get display order ID
  const getOrderId = () => {
    return order.order_number || order.id?.slice(-6).toUpperCase() || 'NO_ID';
  };

  // Get customer/table info
  const getCustomerInfo = () => {
    const customerName = order.customer_name || 'Guest';
    if (order.customer_type === 'dine_in') {
      return `Table - ${customerName}`;
    } else if (order.customer_type === 'takeaway') {
      return `Takeaway - ${customerName}`;
    } else if (order.customer_type === 'delivery') {
      return `Delivery - ${customerName}`;
    }
    return customerName;
  };

  // Handle action buttons
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

  // Get action button config
  const getActionButtons = () => {
    switch (status) {
      case 'NEW':
        return [
          { 
            label: 'Start', 
            icon: Play, 
            onClick: handlePrimaryAction, 
            variant: 'primary' as const,
            show: true
          }
        ];
      case 'PROCESS':
        return [
          { 
            label: 'Pause', 
            icon: Pause, 
            onClick: handleSecondaryAction, 
            variant: 'secondary' as const,
            show: true
          },
          { 
            label: 'Finish', 
            icon: Check, 
            onClick: handlePrimaryAction, 
            variant: 'success' as const,
            show: true
          }
        ];
      case 'READY':
        return [
          { 
            label: 'Serve', 
            icon: Check, 
            onClick: handlePrimaryAction, 
            variant: 'success' as const,
            show: true
          }
        ];
      default:
        return [];
    }
  };

  const actionButtons = getActionButtons();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header with table and order ID */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base">
            {getCustomerInfo()}
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <span className="text-gray-400">📋</span>
            Order #{getOrderId()}
          </p>
        </div>
        
        {/* Timer circle - showing current time like reference image */}
        <div className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full border-2",
          status === 'NEW' && "bg-blue-50 border-blue-200",
          status === 'PROCESS' && "bg-orange-50 border-orange-200", 
          status === 'READY' && "bg-blue-50 border-blue-200",
          status === 'SERVED' && "bg-gray-50 border-gray-200"
        )}>
          <div className="text-center">
            <div className="text-xs font-bold text-gray-900 leading-tight">{currentTime}</div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-4">
        {order.items?.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900">
              {item.quantity}x {item.name}
            </span>
            {item.estimated_time && (
              <span className="text-xs text-gray-500 ml-auto">
                {item.estimated_time} mins
              </span>
            )}
          </div>
        )) || (
          <div className="text-sm text-gray-500 italic">
            No items available
          </div>
        )}
      </div>

      {/* Special requests display */}
      {order.items?.some(item => item.special_requests) && (
        <div className="mb-3">
          {order.items.filter(item => item.special_requests).map((item, index) => (
            <p key={index} className="text-xs text-gray-600 italic">
              {item.name}: {item.special_requests}
            </p>
          ))}
        </div>
      )}

      {/* Action buttons - larger like reference image */}
      {actionButtons.length > 0 && (
        <div className="flex gap-2">
          {actionButtons.map((button, index) => 
            button.show && (
              <button
                key={index}
                onClick={button.onClick}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors',
                  button.variant === 'primary' && 'bg-blue-500 hover:bg-blue-600 text-white',
                  button.variant === 'secondary' && 'bg-blue-500 hover:bg-blue-600 text-white',
                  button.variant === 'success' && 'bg-green-500 hover:bg-green-600 text-white'
                )}
              >
                <button.icon className="w-4 h-4" />
                {button.label}
              </button>
            )
          )}
        </div>
      )}

    </div>
  );
};