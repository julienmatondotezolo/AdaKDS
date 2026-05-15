'use client';

import { useEffect, useCallback } from 'react';
import { useKDSStore } from '@/store/kds-store';
import { useRestaurant } from '@/contexts/restaurant-context';
import type { Order } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app';

export const useRealtime = () => {
  const { setConnected, setOrders, addOrder } = useKDSStore();
  const { restaurantId: RESTAURANT_ID } = useRestaurant();

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

  useEffect(() => {
    if (!RESTAURANT_ID) {
      console.log('[REALTIME] Waiting for restaurant ID before loading orders');
      return;
    }

    const setupRealtime = async () => {
      try {
        console.log('[REALTIME] Setting up API-based realtime for restaurant:', RESTAURANT_ID);

        // Load initial data from API
        console.log('[REALTIME] Loading initial orders...');
        const response = await fetch(`${API_URL}/api/v1/restaurants/${RESTAURANT_ID}/orders`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const orders: Order[] = await response.json();
          console.log(`[REALTIME] Loaded ${orders?.length || 0} initial orders`);
          setOrders(orders || []);
          setConnected(true);
        } else {
          console.error('[REALTIME] Error loading initial orders:', response.status, response.statusText);
          setConnected(false);
        }

        // Request notification permission
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('[NOTIFICATIONS] Permission:', permission);
          } else {
            console.log('[NOTIFICATIONS] Permission:', Notification.permission);
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
      console.log('[REALTIME] Cleaning up');
      setConnected(false);
    };
  }, [RESTAURANT_ID, setConnected, setOrders, addOrder, playNotificationSound]);

  return {
    isConnected: useKDSStore(state => state.isConnected),
  };
};