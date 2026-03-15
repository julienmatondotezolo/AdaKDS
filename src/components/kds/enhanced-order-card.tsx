'use client';

import React from 'react';
import { Clock, User, AlertTriangle, CheckCircle, ChefHat, Timer, Utensils } from 'lucide-react';
import { Card, Badge } from 'ada-design-system';
import { cn, formatElapsedTime, formatTimeToReady, getOrderUrgency, canBumpOrder, getNextStatus } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types';

interface EnhancedOrderCardProps {
  order: Order;
  onBump?: (orderId: string) => void;
  onComplete?: (orderId: string) => void;
  compact?: boolean;
}

export const EnhancedOrderCard: React.FC<EnhancedOrderCardProps> = ({ 
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

  // Professional KDS color scheme
  const statusColors = {
    new: 'bg-emerald-500',
    preparing: 'bg-amber-500', 
    ready: 'bg-red-500',
    completed: 'bg-gray-400'
  };

  const priorityBorders = {
    low: 'border-l-gray-300',
    normal: 'border-l-blue-400',
    high: 'border-l-orange-400',
    urgent: 'border-l-red-500 border-l-4 shadow-lg shadow-red-200'
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg border-l-8',
      priorityBorders[order.priority],
      {
        'animate-pulse border-red-500 shadow-lg shadow-red-200': isOverdue,
        'border-amber-400 shadow-md': urgency === 'warning',
      }
    )}>
      {/* Header with Order Number and Status */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-gray-900">
              {order.order_number}
            </div>
            <Badge 
              variant={order.status === 'ready' ? 'destructive' : order.status === 'new' ? 'success' : 'default'}
              className="uppercase tracking-wide font-semibold"
            >
              {order.status}
            </Badge>
            {order.priority !== 'normal' && (
              <Badge 
                variant={order.priority === 'urgent' ? 'destructive' : 'warning'}
                className="uppercase text-xs"
              >
                {order.priority}
              </Badge>
            )}
          </div>
          
          {/* Timer Display */}
          <div className={cn('flex items-center gap-2 font-mono text-lg font-bold', {
            'text-green-600': urgency === 'normal',
            'text-amber-600': urgency === 'warning', 
            'text-red-600 animate-pulse': urgency === 'critical'
          })}>
            <Timer className="h-5 w-5" />
            {formatElapsedTime(order.elapsed_time)}
          </div>
        </div>
      </div>

      {/* Customer & Order Type */}
      <div className="px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-gray-900">{order.customer_name}</span>
            {order.customer_type === 'takeaway' && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                TAKEAWAY
              </Badge>
            )}
            {order.customer_type === 'delivery' && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                DELIVERY
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            Ready in: <span className={cn('font-semibold', {
              'text-green-600': urgency === 'normal',
              'text-amber-600': urgency === 'warning',
              'text-red-600': urgency === 'critical'
            })}>
              {formatTimeToReady(order.estimated_ready_time, order.order_time)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-4 py-4">
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={item.id || index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Utensils className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-gray-900 text-lg">
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                  {item.special_requests && (
                    <div className="ml-6 text-sm bg-amber-50 text-amber-800 p-2 rounded border-l-4 border-amber-400">
                      <strong>Special:</strong> {item.special_requests}
                    </div>
                  )}
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm text-gray-500">Est. {item.estimated_time}m</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {item.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={cn('h-2 rounded-full transition-all duration-500', {
              'bg-green-500': urgency === 'normal',
              'bg-amber-500': urgency === 'warning',
              'bg-red-500 animate-pulse': urgency === 'critical'
            })}
            style={{ 
              width: `${Math.min(Math.max((order.elapsed_time / (order.total_prep_time * 60)) * 100, 5), 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      {canBump && (
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            {nextStatus && (
              <Button
                onClick={handleBump}
                variant={nextStatus === 'completed' ? 'success' : 'primary'}
                size="large"
                className="flex-1 py-3 text-lg font-semibold"
              >
                <ChefHat className="h-5 w-5 mr-2" />
                {nextStatus === 'preparing' && '🔥 Start Cooking'}
                {nextStatus === 'ready' && '✅ Mark Ready'}
                {nextStatus === 'completed' && '🎯 Complete'}
              </Button>
            )}
            
            {order.status !== 'completed' && (
              <Button
                onClick={handleComplete}
                variant="ghost"
                size="large"
                className="px-4"
              >
                <CheckCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer with timestamps */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span>
            Ordered: {new Date(order.order_time).toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Est. {order.total_prep_time}m prep
          </span>
        </div>
      </div>

      {/* Urgency Indicator */}
      {isOverdue && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="h-6 w-6 text-red-500 animate-bounce" />
        </div>
      )}
    </Card>
  );
};