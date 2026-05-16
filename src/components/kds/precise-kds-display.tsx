'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { PreciseKDSHeader } from './precise-kds-header';
import { GlobalStatusCards } from './global-status-cards';
import { PreciseOrderCard } from './precise-order-card';
import { useKDSStore } from '@/store/kds-store';
import { useSocket } from '@/hooks/use-socket';
import { createOrdersApi } from '@/lib/api';
import { useRestaurant } from '@/contexts/restaurant-context';
import { useTranslation } from '@/i18n/locale-context';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';
import type { OrderStatus } from '@/types';

interface KanbanColumn {
  id: string;
  title: string;
  status: 'NEW' | 'PROCESS' | 'READY' | 'SERVED';
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'new', title: 'New', status: 'NEW' },
  { id: 'process', title: 'Process', status: 'PROCESS' },
  { id: 'ready', title: 'Ready', status: 'READY' },
  { id: 'served', title: 'Served', status: 'SERVED' },
];

const TABLE_PATTERN = /^Table\s+(\S+)$/i;

const getColumnStatus = (raw: string | undefined): 'NEW' | 'PROCESS' | 'READY' | 'SERVED' => {
  switch (raw?.toLowerCase()) {
    case 'preparing': return 'PROCESS';
    case 'ready': return 'READY';
    case 'completed': return 'SERVED';
    default: return 'NEW';
  }
};

const getGroupKey = (order: any): string => {
  let tableKey: string | null = null;
  if (order.table_number) {
    tableKey = `table:${String(order.table_number).toLowerCase()}`;
  } else {
    const m = order.customer_name?.match(TABLE_PATTERN);
    if (m) tableKey = `table:${m[1].toLowerCase()}`;
  }
  if (!tableKey) return `order:${order.id}`;
  // Multi-device QR: same device at same table groups (multiple rounds),
  // different devices at the same table get their own cards. Legacy/POS
  // orders without a guest_session_id continue to group by table only.
  return order.guest_session_id ? `${tableKey}|guest:${order.guest_session_id}` : tableKey;
};

const orderTs = (o: any): number => {
  const v = o.created_at || o.order_time;
  const t = v ? new Date(v).getTime() : NaN;
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
};

/**
 * Visual cluster key — collapses guest_session_id off the group key so that
 * groups from different devices at the same table land in the same cluster.
 * Used only for rendering (tray wrapper); does NOT affect grouping for
 * status mutations.
 */
const getTableClusterKey = (order: any): string => {
  if (order.table_number) return `table:${String(order.table_number).toLowerCase()}`;
  const m = order.customer_name?.match(TABLE_PATTERN);
  if (m) return `table:${m[1].toLowerCase()}`;
  return `solo:${order.id}`;
};

const getTableClusterLabel = (order: any): string | null => {
  if (order.table_number) return `Table ${order.table_number}`;
  const m = order.customer_name?.match(TABLE_PATTERN);
  return m ? `Table ${m[1]}` : null;
};

export const PreciseKDSDisplay: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    orders,
    setOrders,
    bumpOrder,
    markOrderCompleted,
    lastAction,
    recordAction,
    clearLastAction,
  } = useKDSStore();

  const { isConnected } = useSocket();
  const { restaurantId } = useRestaurant();
  const { t } = useTranslation();
  const ordersApi = useMemo(
    () => restaurantId ? createOrdersApi(restaurantId) : null,
    [restaurantId]
  );

  const stableSetOrders = useCallback(setOrders, [setOrders]);
  
  // Load initial data
  useEffect(() => {
    if (!ordersApi) return;
    const loadInitialData = async () => {
      try {
        setError(null);
        setIsLoading(true);
        console.log('[KDS] Loading orders...');

        const ordersResponse = await ordersApi.getAll().catch(err => {
          console.error('[ORDERS] API error:', err);
          return []; // Return empty array on error
        });

        // Handle orders response format
        if (Array.isArray(ordersResponse)) {
          console.log('Setting orders:', ordersResponse.length, 'orders');
          stableSetOrders(ordersResponse);
        } else if (ordersResponse && typeof ordersResponse === 'object') {
          if ('success' in ordersResponse && ordersResponse.success && 'orders' in ordersResponse) {
            const orders = (ordersResponse as any).orders;
            console.log('Setting orders (wrapped):', orders.length, 'orders');
            stableSetOrders(orders);
          } else if ('data' in ordersResponse) {
            const data = (ordersResponse as any).data;
            console.log('Setting orders (data prop):', data.length, 'orders');
            stableSetOrders(data);
          } else {
            console.log('No orders found, setting empty array');
            stableSetOrders([]);
          }
        } else {
          console.log('No orders found, setting empty array');
          stableSetOrders([]);
        }

      } catch (error) {
        console.error('Failed to load KDS data:', error);
        setError('Failed to load kitchen data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [stableSetOrders, ordersApi]);

  // Refresh orders every 30 seconds
  useEffect(() => {
    if (!ordersApi) return;
    const refreshInterval = setInterval(async () => {
      try {
        const response = await ordersApi.getAll();
        // Handle both array and wrapped response formats
        if (Array.isArray(response)) {
          stableSetOrders(response);
        } else if (response && typeof response === 'object') {
          if ('success' in response && response.success && 'orders' in response) {
            stableSetOrders((response as any).orders);
          } else if ('data' in response) {
            stableSetOrders((response as any).data);
          }
        }
      } catch (error) {
        console.error('Failed to refresh orders:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [stableSetOrders, ordersApi]);

  const updateGroup = async (orderIds: string[], status: string) => {
    if (!ordersApi) return;
    await Promise.all(
      orderIds.map((id) =>
        ordersApi.updateStatus(id, status).catch((err) => {
          console.error(`Failed to update order ${id} → ${status}:`, err);
        })
      )
    );
  };

  /**
   * Capture each affected order's status BEFORE mutating, then update.
   * Used by Start/Finish/Serve so Undo can revert the group.
   */
  const transitionGroup = async (orderIds: string[], nextStatus: OrderStatus) => {
    const before = orderIds
      .map((id) => {
        const o = orders.find((x) => x.id === id);
        return o ? { orderId: id, previousStatus: o.status as OrderStatus } : null;
      })
      .filter((x): x is { orderId: string; previousStatus: OrderStatus } => !!x);

    if (before.length === 0) return;

    recordAction({ changes: before, appliedStatus: nextStatus, at: Date.now() });
    // Optimistic local update so the UI moves immediately.
    before.forEach(({ orderId }) => useKDSStore.getState().updateOrder(orderId, { status: nextStatus }));
    await updateGroup(orderIds, nextStatus);
  };

  const handleStartOrder = (orderIds: string[]) => transitionGroup(orderIds, 'preparing');
  const handleFinishOrder = (orderIds: string[]) => transitionGroup(orderIds, 'ready');
  const handleServeOrder = (orderIds: string[]) => transitionGroup(orderIds, 'completed');

  const handleUndoLastAction = async () => {
    if (!lastAction || !ordersApi) return;
    const { changes } = lastAction;
    // Optimistic revert
    changes.forEach(({ orderId, previousStatus }) =>
      useKDSStore.getState().updateOrder(orderId, { status: previousStatus })
    );
    clearLastAction();
    // Persist
    await Promise.all(
      changes.map(({ orderId, previousStatus }) =>
        ordersApi.updateStatus(orderId, previousStatus).catch((err) => {
          console.error(`Undo failed for ${orderId} → ${previousStatus}:`, err);
        })
      )
    );
  };

  // ordersByStatus[col] is an array of GROUPS, each group is an Order[]
  const ordersByStatus = useMemo(() => {
    const byStatus: Record<string, Map<string, typeof orders>> = {};
    for (const order of orders) {
      const col = getColumnStatus(order.status as unknown as string);
      if (!byStatus[col]) byStatus[col] = new Map();
      const key = getGroupKey(order);
      const existing = byStatus[col].get(key);
      if (existing) existing.push(order);
      else byStatus[col].set(key, [order]);
    }
    // Convert each column's map to an array of groups, sorted by oldest order first
    const result: Record<string, typeof orders[]> = {};
    for (const [col, groupsMap] of Object.entries(byStatus)) {
      const groups = Array.from(groupsMap.values());
      groups.forEach((g) => g.sort((a, b) => orderTs(a) - orderTs(b)));
      groups.sort((a, b) => orderTs(a[0]) - orderTs(b[0]));
      result[col] = groups;
    }
    return result;
  }, [orders]);

  const getStatusCount = (status: string) =>
    (ordersByStatus[status] || []).reduce((sum, group) => sum + group.length, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('loading.title')}</h2>
          <p className="text-gray-600 text-lg">{t('loading.subtitle')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <RotateCcw className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('error.connection.title')}</h2>
          <p className="text-gray-600 text-lg mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('error.retry')}
          </button>
        </div>
      </div>
    );
  }

  const columnTitleKey: Record<typeof KANBAN_COLUMNS[number]['status'], string> = {
    NEW: 'columns.new',
    PROCESS: 'columns.process',
    READY: 'columns.ready',
    SERVED: 'columns.served',
  };
  const emptyKey: Record<typeof KANBAN_COLUMNS[number]['status'], string> = {
    NEW: 'empty.new',
    PROCESS: 'empty.process',
    READY: 'empty.ready',
    SERVED: 'empty.served',
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Precise Header */}
      <PreciseKDSHeader isConnected={isConnected} />

      {/* Connection Status Warning */}
      {!isConnected && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
          {t('warning.disconnected')}
        </div>
      )}

      {/* Global Status Cards */}
      <GlobalStatusCards
        newCount={getStatusCount('NEW')}
        processCount={getStatusCount('PROCESS')}
        readyCount={getStatusCount('READY')}
        servedCount={getStatusCount('SERVED')}
      />

      {/* Four Column Kanban Layout */}
      <div className="px-6 pb-20">
        <div className="grid grid-cols-4 gap-6">
          {KANBAN_COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-600 flex items-center gap-2">
                  {t(columnTitleKey[column.status])}
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-bold">
                    {getStatusCount(column.status)}
                  </span>
                </h2>
              </div>

              {/* Column Content */}
              <div className="space-y-4 min-h-[600px]">
                {(ordersByStatus[column.status]?.length ?? 0) === 0 ? (
                  <div className="text-center text-gray-400 mt-20">
                    <p className="text-sm text-gray-500">{t(emptyKey[column.status])}</p>
                  </div>
                ) : (
                  (() => {
                    // Sub-cluster the column's groups by table (ignoring guest_session_id)
                    // so two devices at the same table sit in a shared tray without
                    // losing their per-device cards / per-device transitions.
                    const groups = ordersByStatus[column.status] || [];
                    type Cluster = { key: string; tableLabel: string | null; groups: typeof groups };
                    const clusters: Cluster[] = [];
                    const byKey = new Map<string, Cluster>();
                    for (const group of groups) {
                      const first = group[0];
                      const key = getTableClusterKey(first);
                      let cluster = byKey.get(key);
                      if (!cluster) {
                        cluster = { key, tableLabel: getTableClusterLabel(first), groups: [] };
                        byKey.set(key, cluster);
                        clusters.push(cluster);
                      }
                      cluster.groups.push(group);
                    }
                    return clusters.map((cluster) => {
                      const cards = cluster.groups.map((group) => (
                        <PreciseOrderCard
                          key={group.map((o) => o.id).join('|')}
                          orders={group}
                          status={column.status}
                          onStartOrder={handleStartOrder}
                          onFinishOrder={handleFinishOrder}
                          onServeOrder={handleServeOrder}
                        />
                      ));
                      // Single-card clusters render as before (no tray chrome).
                      if (cluster.groups.length < 2 || !cluster.tableLabel) {
                        return <React.Fragment key={cluster.key}>{cards}</React.Fragment>;
                      }
                      return (
                        <div
                          key={cluster.key}
                          className="rounded-xl border border-gray-300 bg-gray-100/60 p-2 space-y-2"
                        >
                          <div className="px-1 pt-1 flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            <span>{cluster.tableLabel}</span>
                            <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px] normal-case font-bold">
                              {cluster.groups.length}
                            </span>
                          </div>
                          {cards}
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Undo Last Action Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleUndoLastAction}
          disabled={!lastAction}
          className={cn(
            'bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-colors',
            lastAction ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          )}
        >
          <RotateCcw className="w-5 h-5 text-gray-500" />
          {t('footer.undo')}
        </button>
      </div>
    </div>
  );
};