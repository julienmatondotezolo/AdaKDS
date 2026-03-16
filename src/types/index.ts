export interface Order {
  id: string;
  order_number: string;
  restaurant_id: string;
  status: OrderStatus;
  station: string;
  priority: OrderPriority;
  items: OrderItem[];
  customer_name: string;
  customer_type: CustomerType;
  order_time: string;
  estimated_ready_time: string;
  elapsed_time: number;
  total_prep_time: number;
  rush_level: RushLevel;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  special_requests?: string;
  estimated_time: number;
  category: string;
}

export interface Station {
  id: string;
  restaurant_id: string;
  name: string;
  code: string;
  description?: string;
  color: string;
  display_order: number;
  active: boolean;
  estimated_capacity: number;
  current_load: number;
  categories: string[];
  created_at: string;
  updated_at: string;
}

export interface DisplayConfig {
  restaurant_id: string;
  theme: DisplayTheme;
  refresh_interval: number;
  auto_bump_ready_orders: boolean;
  auto_bump_delay: number;
  show_order_times: boolean;
  show_customer_info: boolean;
  show_special_requests: boolean;
  show_item_quantities: boolean;
  sound_enabled: boolean;
  sound_volume: number;
  notification_sounds: NotificationSounds;
  display_layout: DisplayLayout;
  station_colors: Record<string, string>;
  priority_colors: Record<OrderPriority, string>;
  status_colors: Record<OrderStatus, string>;
  time_warnings: TimeWarnings;
  filters: DisplayFilters;
  created_at: string;
  updated_at: string;
}

export interface NotificationSounds {
  new_order: string;
  order_ready: string;
  order_overdue: string;
  order_cancelled: string;
}

export interface DisplayLayout {
  columns: number;
  max_orders_per_column: number;
  card_size: CardSize;
  show_station_headers: boolean;
  compact_mode: boolean;
}

export interface TimeWarnings {
  yellow_threshold: number;
  red_threshold: number;
  critical_threshold: number;
}

export interface DisplayFilters {
  hide_completed: boolean;
  hide_cancelled: boolean;
  group_by_station: boolean;
  sort_by: SortOption;
}

export interface Alert {
  id: string;
  level: AlertLevel;
  type: AlertType;
  message: string;
  order_id?: string;
  station?: string;
  timestamp: string;
}

export interface KDSStore {
  // State
  orders: Order[];
  stations: Station[];
  config: DisplayConfig | null;
  isConnected: boolean;
  selectedStations: string[];
  currentTime: Date;
  
  // Actions
  setOrders: (orders: Order[]) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  addOrder: (order: Order) => void;
  removeOrder: (orderId: string) => void;
  setStations: (stations: Station[]) => void;
  setConfig: (config: DisplayConfig) => void;
  setConnected: (connected: boolean) => void;
  setSelectedStations: (stations: string[]) => void;
  bumpOrder: (orderId: string) => void;
  markOrderCompleted: (orderId: string) => void;
}

// Enums and Union Types
export type OrderStatus = "new" | "preparing" | "ready" | "completed" | "cancelled";
export type OrderPriority = "low" | "normal" | "high" | "urgent";
export type CustomerType = "dine_in" | "takeaway" | "delivery";
export type RushLevel = "low" | "moderate" | "high" | "extreme";
export type DisplayTheme = "light" | "dark";
export type CardSize = "small" | "medium" | "large";
export type SortOption = "order_time" | "priority" | "estimated_time";
export type AlertLevel = "info" | "warning" | "error" | "success";
export type AlertType = "order_overdue" | "station_busy" | "system_error" | "test";
export type StationStatus = "normal" | "busy" | "overloaded" | "offline";
export type NotificationType = "info" | "success" | "warning" | "error";

// Socket.IO Events
export interface SocketEvents {
  order_status_updated: {
    order_id: string;
    old_status: string;
    new_status: OrderStatus;
    updated_at: string;
    restaurant_id: string;
  };
  
  order_bumped: {
    order_id: string;
    old_status: OrderStatus;
    new_status: OrderStatus;
    bump_time: string;
    restaurant_id: string;
  };
  
  station_updated: {
    station: Station;
    restaurant_id: string;
  };
  
  display_config_updated: {
    restaurant_id: string;
    config: DisplayConfig;
    updated_at: string;
  };
  
  test_alert: {
    id: string;
    type: string;
    level: AlertLevel;
    message: string;
    timestamp: string;
    restaurant_id: string;
    auto_dismiss?: number;
  };
  
  display_notification: {
    id: string;
    restaurant_id: string;
    title?: string;
    message?: string;
    type: NotificationType;
    duration: number;
    sound: boolean;
    timestamp: string;
  };
}