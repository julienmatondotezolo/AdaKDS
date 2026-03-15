import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Order, OrderStatus, OrderPriority } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Time formatting utilities
export const formatElapsedTime = (elapsedSeconds: number): string => {
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatTimeToReady = (estimatedReadyTime: string, orderTime: string): string => {
  const now = new Date();
  const ready = new Date(estimatedReadyTime);
  const diffMs = ready.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    const overdue = Math.abs(diffMs);
    const overdueMinutes = Math.floor(overdue / (1000 * 60));
    return `${overdueMinutes}m overdue`;
  }
  
  const minutes = Math.ceil(diffMs / (1000 * 60));
  return `${minutes}m`;
};

export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const formatOrderTime = (timestamp: string): string => {
  const time = new Date(timestamp);
  return time.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Order status utilities
export const getStatusColor = (status: OrderStatus): string => {
  const colors = {
    new: 'bg-status-new text-white',
    preparing: 'bg-status-preparing text-white',
    ready: 'bg-status-ready text-white',
    completed: 'bg-status-completed text-white',
    cancelled: 'bg-gray-400 text-white',
  };
  return colors[status] || colors.new;
};

export const getPriorityColor = (priority: OrderPriority): string => {
  const colors = {
    low: 'border-priority-low',
    normal: 'border-priority-normal',
    high: 'border-priority-high',
    urgent: 'border-priority-urgent',
  };
  return colors[priority] || colors.normal;
};

export const getStationColor = (stationCode: string): string => {
  const colors = {
    hot_kitchen: 'bg-station-hot',
    cold_prep: 'bg-station-cold',
    grill: 'bg-station-grill',
    bar: 'bg-station-bar',
  };
  return colors[stationCode as keyof typeof colors] || 'bg-gray-500';
};

// Order timing utilities
export const getOrderUrgency = (order: Order): 'normal' | 'warning' | 'critical' => {
  const now = new Date();
  const estimated = new Date(order.estimated_ready_time);
  const orderTime = new Date(order.order_time);
  const totalEstimatedMs = estimated.getTime() - orderTime.getTime();
  const elapsedMs = now.getTime() - orderTime.getTime();
  const progress = elapsedMs / totalEstimatedMs;
  
  if (progress >= 1.1) return 'critical'; // 110% overdue
  if (progress >= 0.8) return 'warning';  // 80% of time elapsed
  return 'normal';
};

export const isOrderOverdue = (order: Order): boolean => {
  return getOrderUrgency(order) === 'critical';
};

export const getOrderProgress = (order: Order): number => {
  const now = new Date();
  const orderTime = new Date(order.order_time);
  const estimatedTime = new Date(order.estimated_ready_time);
  
  const totalMs = estimatedTime.getTime() - orderTime.getTime();
  const elapsedMs = now.getTime() - orderTime.getTime();
  
  return Math.min(Math.max(elapsedMs / totalMs, 0), 1.5); // Cap at 150%
};

// Status transitions
export const canBumpOrder = (status: OrderStatus): boolean => {
  return ['new', 'preparing', 'ready'].includes(status);
};

export const getNextStatus = (status: OrderStatus): OrderStatus | null => {
  const transitions = {
    new: 'preparing',
    preparing: 'ready',
    ready: 'completed',
  } as const;
  
  return transitions[status as keyof typeof transitions] || null;
};

// Validation utilities
export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return ['new', 'preparing', 'ready', 'completed', 'cancelled'].includes(status);
};

export const isValidPriority = (priority: string): priority is OrderPriority => {
  return ['low', 'normal', 'high', 'urgent'].includes(priority);
};

// Animation utilities
export const getStatusAnimation = (status: OrderStatus): string => {
  const animations = {
    new: 'animate-pulse-soft',
    preparing: 'animate-fade-in',
    ready: 'animate-bounce-subtle',
    completed: 'animate-fade-in opacity-60',
    cancelled: 'animate-fade-in opacity-40',
  };
  return animations[status] || '';
};

// Sound utilities
export const shouldPlaySound = (oldStatus: OrderStatus, newStatus: OrderStatus): boolean => {
  // Play sound for meaningful status changes
  const importantTransitions = [
    'new:preparing',
    'preparing:ready', 
    'ready:completed',
  ];
  
  const transition = `${oldStatus}:${newStatus}`;
  return importantTransitions.includes(transition);
};

// LocalStorage utilities
export const saveKDSSettings = (settings: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kds-settings', JSON.stringify(settings));
  }
};

export const loadKDSSettings = (): any => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('kds-settings');
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

// Debounce utility
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), waitMs);
  };
}

// Generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};