'use client';

import React from 'react';
import { 
  Play, 
  Pause, 
  Check, 
  Clock, 
  Bell, 
  CheckCircle2,
  Utensils
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

interface EnhancedOrderCardProps {
  order: Order;
  status: 'NEW' | 'PROCESS' | 'READY' | 'SERVED';
  onStartOrder?: (orderId: string) => void;
  onPauseOrder?: (orderId: string) => void;
  onFinishOrder?: (orderId: string) => void;
  onServeOrder?: (orderId: string) => void;
}

export const EnhancedOrderCard: React.FC<EnhancedOrderCardProps> = ({ 
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

  // Get order time formatted for display
  const getOrderTime = () => {
    if (!order.created_at) return '--:--';
    const date = new Date(order.created_at);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const elapsedMinutes = getElapsedMinutes();
  const orderTime = getOrderTime();

  // Get display order number
  const getOrderNumber = () => {
    return order.order_number || order.id?.slice(-6).toUpperCase() || 'NO_ID';
  };

  // Get customer/table info
  const getTableInfo = () => {
    if (order.customer_type === 'dine_in') {
      return `Table ${order.customer_name || 'Unknown'}`;
    } else if (order.customer_type === 'takeaway') {
      return `Takeaway`;
    } else if (order.customer_type === 'delivery') {
      return `Delivery`;
    }
    return `Table ${order.customer_name || 'Unknown'}`;
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (status) {
      case 'NEW':
        return { 
          icon: <Bell className="w-3 h-3" />, 
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          text: 'New Order'
        };
      case 'PROCESS':
        return { 
          icon: <Clock className="w-3 h-3" />, 
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          text: 'In Progress'
        };
      case 'READY':
        return { 
          icon: <CheckCircle2 className="w-3 h-3" />, 
          color: 'bg-green-100 text-green-700 border-green-200',
          text: 'Ready'
        };
      case 'SERVED':
        return { 
          icon: <Check className="w-3 h-3" />, 
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          text: 'Served'
        };
      default:
        return { 
          icon: <Bell className="w-3 h-3" />, 
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          text: 'Unknown'
        };
    }
  };

  // Action handlers
  const handleStartOrder = () => onStartOrder?.(order.id);
  const handlePauseOrder = () => onPauseOrder?.(order.id);
  const handleFinishOrder = () => onFinishOrder?.(order.id);
  const handleServeOrder = () => onServeOrder?.(order.id);

  const statusBadge = getStatusBadge();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Card Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {getTableInfo()}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">#{getOrderNumber()}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">{orderTime}</span>
            </div>
          </div>
          
          {/* Timer Circle */}
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full border-2 bg-gray-50",
            status === 'NEW' && "border-blue-200 bg-blue-50",
            status === 'PROCESS' && "border-orange-200 bg-orange-50",
            status === 'READY' && "border-green-200 bg-green-50",
            status === 'SERVED' && "border-gray-200 bg-gray-50"
          )}>
            <span className={cn(
              "text-xs font-bold",
              status === 'NEW' && "text-blue-700",
              status === 'PROCESS' && "text-orange-700",
              status === 'READY' && "text-green-700",
              status === 'SERVED' && "text-gray-700"
            )}>
              {elapsedMinutes}m
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium mb-3",
          statusBadge.color
        )}>
          {statusBadge.icon}
          {statusBadge.text}
        </div>
      </div>

      {/* Order Items */}
      <div className="px-4 pb-3">
        <div className="space-y-2">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Utensils className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 font-medium">
                  {item.quantity}x {item.name}
                </span>
              </div>
              {item.estimated_time && (
                <span className="text-xs text-gray-500 ml-2">
                  {item.estimated_time}min
                </span>
              )}
            </div>
          )) || (
            <div className="text-sm text-gray-500 italic flex items-center gap-2">
              <Utensils className="w-3.5 h-3.5" />
              No items listed
            </div>
          )}
        </div>

        {/* Special Requests */}
        {order.items?.some(item => item.special_requests) && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Special requests:</span>
              {order.items.filter(item => item.special_requests).map((item, index) => (
                <div key={index} className="mt-1 italic">
                  • {item.special_requests}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4">
        {status === 'NEW' && (
          <button
            onClick={handleStartOrder}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        )}

        {status === 'PROCESS' && (
          <div className="flex gap-2">
            <button
              onClick={handlePauseOrder}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
            <button
              onClick={handleFinishOrder}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              Finish
            </button>
          </div>
        )}

        {status === 'READY' && (
          <button
            onClick={handleServeOrder}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            Serve Order
          </button>
        )}

        {status === 'SERVED' && (
          <div className="text-center text-sm text-gray-500 py-2">
            Order completed
          </div>
        )}
      </div>
    </div>
  );
};