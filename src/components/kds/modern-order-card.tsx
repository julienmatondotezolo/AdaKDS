'use client';

import React from 'react';
import { Clock, User, AlertTriangle, CheckCircle, ChefHat, Timer, Utensils } from 'lucide-react';
import { cn, formatElapsedTime, formatTimeToReady, getOrderUrgency, canBumpOrder, getNextStatus } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types';

interface ModernOrderCardProps {
  order: Order;
  onBump?: (orderId: string) => void;
  onComplete?: (orderId: string) => void;
  compact?: boolean;
}

export const ModernOrderCard: React.FC<ModernOrderCardProps> = ({ 
  order, 
  onBump, 
  onComplete,
  compact = false 
}) => {
  const urgency = getOrderUrgency(order);
  const canBump = canBumpOrder(order.status);
  const nextStatus = getNextStatus(order.status);
  const isOverdue = urgency === 'critical';

  const handleBump = () => {
    if (onBump && canBump) {
      onBump(order.id);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(order.id);
    }
  };

  // Modern KDS status colors
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'new':
        return {
          border: 'border-l-emerald-500',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          glow: 'shadow-emerald-500/20'
        };
      case 'preparing':
        return {
          border: 'border-l-amber-500',
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          glow: 'shadow-amber-500/20'
        };
      case 'ready':
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          glow: 'shadow-red-500/30'
        };
      case 'completed':
        return {
          border: 'border-l-gray-500',
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          glow: 'shadow-gray-500/10'
        };
      default:
        return {
          border: 'border-l-gray-500',
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          glow: 'shadow-gray-500/10'
        };
    }
  };

  const statusColors = getStatusColors(order.status);

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500/50',
          icon: '🔥'
        };
      case 'high':
        return {
          bg: 'bg-orange-500/20',
          text: 'text-orange-400',
          border: 'border-orange-500/50',
          icon: 'Zap'
        };
      case 'normal':
        return null;
      default:
        return null;
    }
  };

  const priorityIndicator = getPriorityIndicator(order.priority);

  return (
    <div className={cn(
      'order-card animate-slide-in',
      statusColors.border,
      statusColors.glow,
      {
        'animate-pulse-glow': order.status === 'ready',
        'animate-flash-urgent': isOverdue,
        'ring-2 ring-red-500/50 ring-offset-2 ring-offset-gray-900': isOverdue
      }
    )}>
      {/* Header Section */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          {/* Order Number & Status */}
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black text-white">
              #{order.order_number}
            </div>
            <div className={cn(
              'status-badge',
              statusColors.bg,
              statusColors.text
            )}>
              {order.status ? order.status.toUpperCase() : 'UNKNOWN'}
            </div>
            {priorityIndicator && (
              <div className={cn(
                'px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider border',
                priorityIndicator.bg,
                priorityIndicator.text,
                priorityIndicator.border
              )}>
                {order.priority ? order.priority.toUpperCase() : 'NORMAL'}
              </div>
            )}
          </div>

          {/* Timer Display */}
          <div className={cn('timer-display flex items-center gap-2', {
            'text-emerald-400': urgency === 'normal',
            'text-amber-400': urgency === 'warning',
            'text-red-400 animate-pulse': urgency === 'critical'
          })}>
            <Timer className="h-6 w-6" />
            {formatElapsedTime(order.elapsed_time)}
          </div>
        </div>

        {/* Customer & Order Type */}
        <div className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <span className="font-bold text-white">{order.customer_name}</span>
            {order.customer_type === 'takeaway' && (
              <div className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-lg text-sm font-bold">
                TAKEAWAY
              </div>
            )}
            {order.customer_type === 'delivery' && (
              <div className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg text-sm font-bold">
                DELIVERY
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-400">
            Ready: <span className={cn('font-bold text-lg', {
              'text-emerald-400': urgency === 'normal',
              'text-amber-400': urgency === 'warning',
              'text-red-400': urgency === 'critical'
            })}>
              {formatTimeToReady(order.estimated_ready_time, order.order_time)}
            </span>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="p-6">
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={item.id || index} className="border-b border-gray-700/30 pb-4 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-ada-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{item.quantity}</span>
                    </div>
                    <span className="font-bold text-white text-xl">
                      {item.name}
                    </span>
                  </div>
                  {item.special_requests && (
                    <div className="ml-11 bg-amber-500/20 border-l-4 border-amber-500 p-3 rounded-r-lg">
                      <div className="text-amber-400 font-bold text-sm mb-1">SPECIAL REQUEST</div>
                      <div className="text-amber-300">{item.special_requests}</div>
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm text-gray-400 mb-1">Est. {item.estimated_time}m</div>
                  <div className="px-2 py-1 bg-gray-600/50 rounded text-xs text-gray-300 font-medium">
                    {item.category ? item.category.toUpperCase() : 'MAIN'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-sm text-gray-400 font-medium">Progress</div>
          <div className="flex-1 bg-gray-700 rounded-full h-3">
            <div 
              className={cn('h-3 rounded-full transition-all duration-500', {
                'bg-emerald-500': urgency === 'normal',
                'bg-amber-500': urgency === 'warning',
                'bg-red-500 animate-pulse': urgency === 'critical'
              })}
              style={{ 
                width: `${Math.min(Math.max((order.elapsed_time / (order.total_prep_time * 60)) * 100, 5), 100)}%` 
              }}
            />
          </div>
          <div className="text-sm text-gray-400">
            {Math.round((order.elapsed_time / (order.total_prep_time * 60)) * 100)}%
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {canBump && (
        <div className="p-6 pt-0">
          <div className="flex gap-3">
            {nextStatus && (
              <Button
                onClick={handleBump}
                className={cn('card-action-button flex-1', {
                  'btn-success': nextStatus === 'completed' || nextStatus === 'ready',
                  'btn-primary': nextStatus === 'preparing'
                })}
              >
                <ChefHat className="h-5 w-5 mr-3" />
                {nextStatus === 'preparing' && 'START COOKING'}
                {nextStatus === 'ready' && 'MARK READY'}
                {nextStatus === 'completed' && 'COMPLETE ORDER'}
              </Button>
            )}
            
            {order.status !== 'completed' && (
              <Button
                onClick={handleComplete}
                className="btn-secondary px-4"
              >
                <CheckCircle className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700/50">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              Ordered: {new Date(order.order_time).toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div className="text-gray-400">
            Est. prep: <span className="font-bold text-white">{order.total_prep_time}m</span>
          </div>
        </div>
      </div>

      {/* Urgency Overlay */}
      {isOverdue && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-red-500 rounded-full p-2 animate-bounce">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};