'use client';

import React from 'react';
import { Clock, User, AlertTriangle, CheckCircle, ChefHat, Timer } from 'lucide-react';
import { Card, Badge, Toast } from 'ada-design-system';
import { cn, formatElapsedTime, formatTimeToReady, getStatusColor, getPriorityColor, getOrderUrgency, canBumpOrder, getNextStatus } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  onBump?: (orderId: string) => void;
  onComplete?: (orderId: string) => void;
  compact?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
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

  return (
    <div 
      className={cn(
        'order-card',
        order.status,
        {
          'overdue': isOverdue,
          'priority-urgent': order.priority === 'urgent',
          'priority-high': order.priority === 'high',
        }
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-gray-900">{order.order_number}</span>
          <div className={cn('status-badge', getStatusColor(order.status))}>
            {order.status}
          </div>
          {order.priority !== 'normal' && (
            <div className={cn('px-2 py-1 rounded text-xs font-medium', getPriorityColor(order.priority))}>
              {order.priority.toUpperCase()}
            </div>
          )}
        </div>
        
        {isOverdue && (
          <AlertTriangle className="h-5 w-5 text-red-500 animate-bounce-subtle" />
        )}
      </div>

      {/* Customer & Type */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span className="font-medium">{order.customer_name}</span>
          {order.customer_type === 'takeaway' && (
            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
              TAKEAWAY
            </span>
          )}
          {order.customer_type === 'delivery' && (
            <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
              DELIVERY
            </span>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="px-4 pb-3">
        <div className="space-y-1">
          {order.items.map((item, index) => (
            <div key={item.id || index} className="text-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">
                    {item.quantity}x {item.name}
                  </span>
                  {item.special_requests && (
                    <div className="text-xs text-orange-600 mt-1 font-medium">
                      {item.special_requests}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {item.estimated_time}m
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timing */}
      <div className="px-4 pb-3 border-t border-gray-100 pt-2">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Elapsed:</span>
            <span className={cn('timer-display text-sm', {
              'text-orange-500': urgency === 'warning',
              'text-red-500': urgency === 'critical'
            })}>
              {formatElapsedTime(order.elapsed_time)}
            </span>
          </div>
          
          <div className="text-right">
            <div className={cn('text-xs', {
              'text-gray-500': urgency === 'normal',
              'text-orange-500': urgency === 'warning',
              'text-red-500': urgency === 'critical'
            })}>
              {formatTimeToReady(order.estimated_ready_time, order.order_time)}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {canBump && (
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            {nextStatus && (
              <Button
                onClick={handleBump}
                variant={nextStatus === 'completed' ? 'success' : 'primary'}
                className="flex-1 touch-manipulation"
                size="sm"
              >
                {nextStatus === 'preparing' && 'Start Cooking'}
                {nextStatus === 'ready' && 'Mark Ready'}
                {nextStatus === 'completed' && 'Complete Order'}
              </Button>
            )}
            
            {order.status !== 'completed' && (
              <Button
                onClick={handleComplete}
                variant="ghost"
                size="sm"
                className="px-3 touch-manipulation"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="px-4 pb-2">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className={cn('h-1 rounded-full transition-all duration-500', {
              'bg-green-500': urgency === 'normal',
              'bg-orange-500': urgency === 'warning',
              'bg-red-500': urgency === 'critical'
            })}
            style={{ 
              width: `${Math.min(Math.max((order.elapsed_time / (order.total_prep_time * 60)) * 100, 0), 150)}%` 
            }}
          />
        </div>
      </div>

      {/* Footer with order time */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
        Ordered: {new Date(order.order_time).toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  );
};