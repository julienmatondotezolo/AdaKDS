'use client';

import { useEffect, useCallback } from 'react';
import { useKDSStore } from '@/store/kds-store';
import { supabase, type KdsOrder } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Order } from '@/types';

const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'c1cbea71-ece5-4d63-bb12-fe06b03d1140';

// Convert Supabase KdsOrder to our internal Order type
const convertKdsOrderToOrder = (kdsOrder: KdsOrder): Order => {
  const orderTime = new Date(kdsOrder.order_time);
  const now = new Date();
  const elapsedTime = Math.floor((now.getTime() - orderTime.getTime()) / 1000);
  
  // Estimate prep time from items or use default
  const totalPrepTime = Array.isArray(kdsOrder.items) 
    ? kdsOrder.items.reduce((sum: number, item: any) => 
        sum + ((item.estimated_time || 10) * (item.quantity || 1)), 0)
    : 15; // default

  // Map to our internal Order structure
  return {
    id: kdsOrder.id,
    order_number: kdsOrder.order_number,
    restaurant_id: kdsOrder.restaurant_id,
    status: kdsOrder.status,
    station: 'hot_kitchen', // Default station - could be improved with item categorization
    priority: kdsOrder.priority,
    items: Array.isArray(kdsOrder.items) ? kdsOrder.items.map((item: any, index: number) => ({
      id: `${kdsOrder.id}_item_${index}`,
      name: item.name || 'Unknown Item',
      quantity: item.quantity || 1,
      special_requests: item.special_requests || '',
      estimated_time: item.estimated_time || 10,
      category: item.category || 'general'
    })) : [],
    customer_name: kdsOrder.customer_name || 'Customer',
    customer_type: (kdsOrder.customer_type as any) || 'dine_in',
    order_time: kdsOrder.order_time,
    estimated_ready_time: kdsOrder.estimated_ready_time || new Date(Date.now() + totalPrepTime * 60000).toISOString(),
    elapsed_time: elapsedTime,
    total_prep_time: totalPrepTime,
    rush_level: elapsedTime > 1800 ? 'extreme' : elapsedTime > 900 ? 'high' : elapsedTime > 300 ? 'moderate' : 'low', // Rush levels based on elapsed time
    created_at: kdsOrder.created_at,
    updated_at: kdsOrder.updated_at
  };
};

export const useRealtime = () => {
  const { setConnected, setOrders, updateOrder, addOrder, removeOrder } = useKDSStore();

  // Sound notification functions
  const playNotificationSound = useCallback((status: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different statuses
      const frequencies = {
        new: 800,        // Higher pitch for new orders
        preparing: 600,  // Medium pitch for in progress
        ready: 400,      // Lower pitch for ready
        completed: 200   // Lowest for completed
      };
      
      oscillator.frequency.setValueAtTime(
        frequencies[status as keyof typeof frequencies] || 600, 
        audioContext.currentTime
      );
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Unable to play notification sound:', error);
    }
  }, []);

  const playBumpSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Create a more pleasant "bump" sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Unable to play bump sound:', error);
    }
  }, []);

  useEffect(() => {
    let ordersChannel: RealtimeChannel | null = null;

    const setupRealtime = async () => {
      try {
        console.log('[REALTIME] Setting up Supabase realtime for restaurant:', RESTAURANT_ID);

        // Subscribe to orders table changes for this restaurant
        ordersChannel = supabase
          .channel('kds_orders')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'kds_orders',
              filter: `restaurant_id=eq.${RESTAURANT_ID}`,
            },
            (payload) => {
              console.log('[REALTIME] Order change:', payload.eventType, payload.new || payload.old);
              
              const order = payload.new as KdsOrder || payload.old as KdsOrder;
              
              switch (payload.eventType) {
                case 'INSERT':
                  if (payload.new) {
                    console.log(`[ORDER] New order: ${order.order_number}`);
                    addOrder(convertKdsOrderToOrder(payload.new as KdsOrder));
                    playNotificationSound('new');
                    
                    // Browser notification for new orders
                    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
                      new Notification('New Order!', {
                        body: `Order ${order.order_number} - ${order.customer_name || 'Customer'}`,
                        icon: '/favicon.ico',
                        tag: order.id,
                      });
                    }
                  }
                  break;
                  
                case 'UPDATE':
                  if (payload.new && payload.old) {
                    const oldOrder = payload.old as KdsOrder;
                    const newOrder = payload.new as KdsOrder;
                    
                    // Check if status changed
                    if (oldOrder.status !== newOrder.status) {
                      console.log(`[ORDER] ${order.order_number}: ${oldOrder.status} → ${newOrder.status}`);
                      playNotificationSound(newOrder.status);
                      
                      // Special sound for bump/completion
                      if (newOrder.status === 'completed' || newOrder.status === 'ready') {
                        playBumpSound();
                      }
                    }
                    
                    updateOrder(order.id, convertKdsOrderToOrder(newOrder));
                  }
                  break;
                  
                case 'DELETE':
                  if (payload.old) {
                    console.log(`[ORDER] Deleted order: ${order.order_number}`);
                    removeOrder(order.id);
                  }
                  break;
              }
            }
          )
          .subscribe((status) => {
            console.log('[REALTIME] Subscription status:', status);
            
            if (status === 'SUBSCRIBED') {
              setConnected(true);
              console.log('[REALTIME] ✅ Successfully subscribed to orders realtime');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              setConnected(false);
              console.error('[REALTIME] ❌ Subscription error:', status);
            } else if (status === 'CLOSED') {
              setConnected(false);
              console.log('[REALTIME] 🔌 Subscription closed');
            }
          });

        // Load initial data
        console.log('[REALTIME] Loading initial orders...');
        const { data: orders, error } = await supabase
          .from('kds_orders')
          .select('*')
          .eq('restaurant_id', RESTAURANT_ID)
          .neq('status', 'completed') // Only active orders
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[REALTIME] Error loading initial orders:', error);
        } else {
          console.log(`[REALTIME] Loaded ${orders?.length || 0} initial orders`);
          const convertedOrders = (orders || []).map(convertKdsOrderToOrder);
          setOrders(convertedOrders);
        }

        // Request notification permission
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('[NOTIFICATIONS] Permission:', permission);
          }
        }

      } catch (error) {
        console.error('[REALTIME] Setup error:', error);
        setConnected(false);
      }
    };

    setupRealtime();

    // Cleanup function
    return () => {
      if (ordersChannel) {
        console.log('[REALTIME] Cleaning up subscription');
        ordersChannel.unsubscribe();
      }
      setConnected(false);
    };
  }, [setConnected, setOrders, updateOrder, addOrder, removeOrder, playNotificationSound, playBumpSound]);

  return {
    isConnected: useKDSStore(state => state.isConnected),
  };
};