import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dxxtxdyrovawugvvrhah.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4eHR4ZHlyb3Zhd3VndnZyaGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzNjgyMDUsImV4cCI6MjA0NDk0NDIwNX0.lNiKXvO8vQ8wfcKHQ4vf0YAqWgCm3_IqPUJ-u0mLNM4';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// KDS specific database types
export interface KdsOrder {
  id: string;
  restaurant_id: string;
  order_number: string;
  status: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  priority: 'normal' | 'high' | 'urgent';
  customer_name: string | null;
  customer_type: string | null;
  table_number: string | null;
  source: string | null;
  order_time: string;
  estimated_ready_time: string | null;
  completed_time: string | null;
  items: any[];
  special_instructions: string | null;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface KdsStation {
  id: string;
  restaurant_id: string;
  name: string;
  code: string;
  color: string;
  display_order: number;
  active: boolean;
  categories: string[];
  created_at: string;
}