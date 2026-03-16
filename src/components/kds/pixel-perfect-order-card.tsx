'use client';

import React from 'react';
import { Pause, Play, Check, Clock, Bell, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

interface PixelPerfectOrderCardProps {
  order: Order;
  status: 'NEW' | 'PROCESS' | 'READY' | 'SERVED';
  onStartOrder?: (orderId: string) => void;
  onPauseOrder?: (orderId: string) => void;
  onFinishOrder?: (orderId: string) => void;
  onServeOrder?: (orderId: string) => void;
}

export const PixelPerfectOrderCard: React.FC<PixelPerfectOrderCardProps> = ({ 
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

  // Get formatted elapsed time display
  const getElapsedTimeDisplay = () => {
    const minutes = getElapsedMinutes();
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  // Get display order ID
  const getOrderId = () => {
    return order.order_number || order.id?.slice(-6).toUpperCase() || 'NO_ID';
  };

  // Get customer/table info
  const getCustomerInfo = () => {
    const customerName = order.customer_name || 'Guest';
    if (order.customer_type === 'dine_in') {
      return `Table ${customerName}`;
    } else if (order.customer_type === 'takeaway') {
      return `Takeaway - ${customerName}`;
    } else if (order.customer_type === 'delivery') {
      return `Delivery - ${customerName}`;
    }
    return customerName;
  };

  // Get order status badge
  const getStatusBadge = () => {
    switch (status) {
      case 'NEW':
        return { text: 'New Order', color: 'bg-blue-100 text-blue-800' };
      case 'PROCESS':
        return { text: 'In Progress', color: 'bg-orange-100 text-orange-800' };
      case 'READY':
        return { text: 'Ready', color: 'bg-green-100 text-green-800' };
      case 'SERVED':
        return { text: 'Served', color: 'bg-gray-100 text-gray-800' };
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
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

  // Get action button configurations matching design exactly
  const getActionButtons = () => {
    switch (status) {
      case 'NEW':
        return [
          { 
            label: 'Start', 
            icon: Play, 
            onClick: handlePrimaryAction, 
            variant: 'blue' as const,
            show: true
          }
        ];
      case 'PROCESS':
        return [
          { 
            label: 'Pause', 
            icon: Pause, 
            onClick: handleSecondaryAction, 
            variant: 'blue' as const,
            show: true
          },
          { 
            label: 'Finish', 
            icon: Check, 
            onClick: handlePrimaryAction, 
            variant: 'green' as const,
            show: true
          }
        ];
      case 'READY':
        return [
          { 
            label: 'Serve Order', 
            icon: CheckCircle, 
            onClick: handlePrimaryAction, 
            variant: 'gray' as const,
            show: true
          }
        ];
      default:
        return [];
    }
  };

  const actionButtons = getActionButtons();
  const elapsedTime = getElapsedTimeDisplay();
  const statusBadge = getStatusBadge();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header with table info and timer */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-lg">
              {getCustomerInfo()}
            </h3>
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusBadge.color)}>
              {statusBadge.text}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="text-gray-400">📋</span>
              Order #{getOrderId()}
            </span>
            
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {elapsedTime}
            </span>
          </div>
        </div>
        
        {/* Timer Circle - exact design match */}
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full border-2 flex-shrink-0",
          status === 'NEW' && "bg-blue-50 border-blue-200",
          status === 'PROCESS' && "bg-orange-50 border-orange-200", 
          status === 'READY' && "bg-green-50 border-green-200",
          status === 'SERVED' && "bg-gray-50 border-gray-200"
        )}>
          <div className="text-center">
            {status === 'NEW' && <Bell className="w-5 h-5 text-blue-600" />}
            {status === 'PROCESS' && <Clock className="w-5 h-5 text-orange-600" />}
            {status === 'READY' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {status === 'SERVED' && <Check className="w-5 h-5 text-gray-600" />}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-4 pb-3">
        <div className="space-y-1">
          {order.items?.length ? (
            order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                    {item.quantity}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.name}
                  </span>
                </div>
                {item.estimated_time && (
                  <span className="text-xs text-gray-500">
                    {item.estimated_time}min
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 italic py-2">
              No items available
            </div>
          )}
        </div>

        {/* Special Requests */}
        {order.items?.some(item => item.special_requests) && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-600">
              {order.items.filter(item => item.special_requests).map((item, index) => (
                <div key={index} className="italic">
                  <span className="font-medium">{item.name}:</span> {item.special_requests}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - exact design match */}
      {actionButtons.length > 0 && (
        <div className="px-4 pb-4">
          <div className={cn(
            "flex gap-2",
            actionButtons.length === 1 ? "justify-center" : "justify-between"
          )}>
            {actionButtons.map((button, index) => 
              button.show && (
                <button
                  key={index}
                  onClick={button.onClick}
                  className={cn(
                    'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200',
                    'flex-1 min-w-0', // Ensure equal width
                    button.variant === 'blue' && 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md',
                    button.variant === 'green' && 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md',
                    button.variant === 'gray' && 'bg-gray-400 hover:bg-gray-500 text-white shadow-sm hover:shadow-md'
                  )}
                >
                  <button.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{button.label}</span>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};