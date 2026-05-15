'use client';

import React from 'react';
import { Play, Pause, Check, Utensils, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useElapsedSeconds } from '@/hooks/use-elapsed-seconds';
import type { Order } from '@/types';

interface PreciseOrderCardProps {
  orders: Order[];
  status: 'NEW' | 'PROCESS' | 'READY' | 'SERVED';
  onStartOrder?: (orderIds: string[]) => void;
  onPauseOrder?: (orderIds: string[]) => void;
  onFinishOrder?: (orderIds: string[]) => void;
  onServeOrder?: (orderIds: string[]) => void;
}

const TABLE_PATTERN = /^Table\s+(\S+)$/i;

function getTableLabel(order: Order): string | null {
  if (order.table_number) return `Table ${order.table_number}`;
  const m = order.customer_name?.match(TABLE_PATTERN);
  return m ? `Table ${m[1]}` : null;
}

function getRealCustomerName(order: Order): string | null {
  if (!order.customer_name) return null;
  if (TABLE_PATTERN.test(order.customer_name)) return null;
  return order.customer_name;
}

const orderTimestampMs = (o: Order): number => {
  const ts = o.created_at || o.order_time;
  const t = ts ? new Date(ts).getTime() : NaN;
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
};

export const PreciseOrderCard: React.FC<PreciseOrderCardProps> = ({
  orders,
  status,
  onStartOrder,
  onPauseOrder,
  onFinishOrder,
  onServeOrder,
}) => {
  const validOrders = orders.filter((o): o is Order => !!o);

  const oldest: Order | undefined =
    validOrders.length > 0
      ? validOrders.reduce((a, b) => (orderTimestampMs(a) <= orderTimestampMs(b) ? a : b))
      : undefined;

  // For SERVED orders, freeze the timer at the latest updated_at across the group
  // (when all items were marked complete). Falls back to freezing at "now" if the
  // backend didn't include updated_at on legacy orders.
  const latestUpdatedIso =
    status === 'SERVED'
      ? validOrders.reduce<string | undefined>((latest, o) => {
          const u = o.updated_at;
          if (!u) return latest;
          return !latest || u > latest ? u : latest;
        }, undefined)
      : undefined;

  const { formatted: elapsedTime, minutes } = useElapsedSeconds(
    oldest?.created_at || oldest?.order_time,
    latestUpdatedIso,
    status === 'SERVED'
  );

  if (!oldest) return null;

  const tableLabel =
    getTableLabel(oldest) ??
    (oldest.customer_type === 'takeaway'
      ? 'Takeaway'
      : oldest.customer_type === 'delivery'
        ? 'Delivery'
        : 'Walk-in');

  const customerNames = Array.from(
    new Set(validOrders.map(getRealCustomerName).filter((n): n is string => !!n))
  );

  const notes = validOrders
    .map((o) => o.special_instructions?.trim())
    .filter((n): n is string => !!n);

  const orderNumbers = validOrders.map((o) => o.order_number).join(' · ');
  const orderIds = validOrders.map((o) => o.id);

  const flattenedItems = validOrders.flatMap((o) =>
    (o.items || []).map((item) => ({ ...item, _orderId: o.id }))
  );

  const getTimerColor = (): 'green' | 'blue' | 'orange' | 'red' | 'gray' => {
    if (status === 'SERVED') return 'gray';
    if (minutes < 5) return 'green';
    if (minutes < 10) return 'blue';
    if (minutes < 15) return 'orange';
    return 'red';
  };
  const timerColor = getTimerColor();

  const handlePrimary = () => {
    if (status === 'NEW') onStartOrder?.(orderIds);
    else if (status === 'PROCESS') onFinishOrder?.(orderIds);
    else if (status === 'READY') onServeOrder?.(orderIds);
  };
  const handlePause = () => onPauseOrder?.(orderIds);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{tableLabel}</h3>
              {validOrders.length > 1 && (
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {validOrders.length} orders
                </span>
              )}
            </div>
            {customerNames.length > 0 && (
              <p className="text-sm text-gray-700 mb-1 truncate">
                {customerNames.join(', ')}
              </p>
            )}
            <p className="text-xs text-gray-500 truncate">{orderNumbers}</p>
          </div>

          <div
            className={cn(
              'shrink-0 w-16 h-16 rounded-full border-4 flex items-center justify-center',
              timerColor === 'green' && 'border-green-200 bg-green-50',
              timerColor === 'blue' && 'border-blue-200 bg-blue-50',
              timerColor === 'orange' && 'border-orange-200 bg-orange-50',
              timerColor === 'red' && 'border-red-200 bg-red-50 animate-pulse',
              timerColor === 'gray' && 'border-gray-200 bg-gray-50'
            )}
          >
            <span
              className={cn(
                'text-sm font-bold tabular-nums',
                timerColor === 'green' && 'text-green-700',
                timerColor === 'blue' && 'text-blue-700',
                timerColor === 'orange' && 'text-orange-700',
                timerColor === 'red' && 'text-red-700',
                timerColor === 'gray' && 'text-gray-500'
              )}
            >
              {elapsedTime}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="space-y-2">
          {flattenedItems.length ? (
            flattenedItems.map((item, index) => (
              <div key={`${item._orderId}-${index}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Utensils className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {item.quantity}x {item.name}
                  </span>
                </div>
                {item.estimated_time && status === 'PROCESS' && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium shrink-0">
                    {item.estimated_time} min
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

      {notes.length > 0 && (
        <div className="mx-4 mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
          <div className="flex items-start gap-2">
            <StickyNote className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-900 space-y-1 min-w-0">
              {notes.map((n, i) => (
                <p key={i} className="whitespace-pre-wrap break-words">{n}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        {status === 'NEW' && (
          <button
            onClick={handlePrimary}
            className="w-full flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        )}

        {status === 'PROCESS' && (
          <div className="flex gap-2">
            <button
              onClick={handlePause}
              className="flex-1 flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
            <button
              onClick={handlePrimary}
              className="flex-1 flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              Finish
            </button>
          </div>
        )}

        {status === 'READY' && (
          <button
            onClick={handlePrimary}
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
