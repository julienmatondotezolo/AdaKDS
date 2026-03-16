const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID;

if (!RESTAURANT_ID) {
  throw new Error('NEXT_PUBLIC_RESTAURANT_ID environment variable is required but not set');
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: 'UNKNOWN_ERROR', 
        message: `HTTP ${response.status}` 
      }));
      
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.error
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or parsing errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      'NETWORK_ERROR'
    );
  }
}

// Orders API
export const ordersApi = {
  async getAll(filters?: { status?: string; station?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.station) params.set('station', filters.station);
    
    const query = params.toString() ? `?${params}` : '';
    return apiRequest<{ success: boolean; orders: any[] }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/orders${query}`
    );
  },

  async updateStatus(orderId: string, status: string, oldStatus?: string) {
    return apiRequest<{ success: boolean; order: any }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status, old_status: oldStatus }),
      }
    );
  },

  async bump(orderId: string, currentStatus?: string) {
    return apiRequest<{ success: boolean; order_id: string; old_status: string; new_status: string }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/orders/${orderId}/bump`,
      {
        method: 'POST',
        body: JSON.stringify({ current_status: currentStatus }),
      }
    );
  },

  async getAnalytics() {
    return apiRequest<any>(
      `/api/v1/restaurants/${RESTAURANT_ID}/orders/analytics`
    );
  },
};

// Stations API
export const stationsApi = {
  async getAll() {
    return apiRequest<{ success: boolean; stations: any[] }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/stations`
    );
  },

  async create(station: any) {
    return apiRequest<{ success: boolean; station: any }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/stations`,
      {
        method: 'POST',
        body: JSON.stringify(station),
      }
    );
  },

  async update(stationId: string, updates: any) {
    return apiRequest<{ success: boolean; station: any }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/stations/${stationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  },

  async getOrders(stationId: string, status?: string) {
    const query = status ? `?status=${status}` : '';
    return apiRequest<{ success: boolean; orders: any[] }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/stations/${stationId}/orders${query}`
    );
  },
};

// Display API
export const displayApi = {
  async getConfig() {
    return apiRequest<{ success: boolean; config: any }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/display/config`
    );
  },

  async updateConfig(config: any) {
    return apiRequest<{ success: boolean; config: any }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/display/config`,
      {
        method: 'PUT',
        body: JSON.stringify(config),
      }
    );
  },

  async getStatus() {
    return apiRequest<{ success: boolean; status: any }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/display/status`
    );
  },

  async sendTestAlert(message: string, level = 'info') {
    return apiRequest<{ success: boolean; alert: any }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/display/test-alert`,
      {
        method: 'POST',
        body: JSON.stringify({ message, level }),
      }
    );
  },

  async forceRefresh() {
    return apiRequest<{ success: boolean; message: string }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/display/refresh`,
      {
        method: 'POST',
      }
    );
  },

  async sendNotification(notification: { 
    title?: string; 
    message?: string; 
    type?: string; 
    duration?: number 
  }) {
    return apiRequest<{ success: boolean; notification: any }>(
      `/api/v1/restaurants/${RESTAURANT_ID}/display/notifications`,
      {
        method: 'POST',
        body: JSON.stringify(notification),
      }
    );
  },
};

// Health check
export const healthApi = {
  async check() {
    return apiRequest<{ status: string; service: string; version: string; uptime: number }>(
      '/health'
    );
  },
};