'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useKDSStore } from '@/store/kds-store';
import type { SocketEvents } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5005';
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'losteria';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { setConnected, updateOrder, setConfig, addOrder } = useKDSStore();

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[SOCKET] Connected to KDS WebSocket');
      setConnected(true);
      
      // Join restaurant room
      socket.emit('join-restaurant', RESTAURANT_ID);
    });

    socket.on('disconnect', () => {
      console.log('[SOCKET] Disconnected from KDS WebSocket');
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[SOCKET] Connection error:', error);
      setConnected(false);
    });

    // Order event handlers
    socket.on('ada_menu_order_received', (data: any) => {
      console.log('[NEW ORDER] AdaMenu order received:', data.order.order_number);
      console.log('Order details:', data.order);
      
      // Add the new order to the store immediately
      addOrder(data.order);
      
      // Play new order notification sound
      playNotificationSound('new');
    });

    socket.on('order_status_updated', (data: SocketEvents['order_status_updated']) => {
      console.log(`[ORDER] ${data.order_id}: ${data.old_status} -> ${data.new_status}`);
      updateOrder(data.order_id, { 
        status: data.new_status,
        updated_at: data.updated_at 
      });
      
      // Play notification sound
      playNotificationSound(data.new_status);
    });

    socket.on('order_bumped', (data: SocketEvents['order_bumped']) => {
      console.log(`[ORDER] ${data.order_id} bumped: ${data.old_status} -> ${data.new_status}`);
      updateOrder(data.order_id, { 
        status: data.new_status,
        updated_at: data.bump_time 
      });
      
      // Play bump sound
      playBumpSound();
    });

    // Station event handlers
    socket.on('station_updated', (data: SocketEvents['station_updated']) => {
      console.log(`[STATION] Updated: ${data.station.name}`);
      // Could update stations in store if needed
    });

    // Display event handlers
    socket.on('display_config_updated', (data: SocketEvents['display_config_updated']) => {
      console.log('[DISPLAY] Config updated');
      setConfig(data.config);
    });

    socket.on('test_alert', (data: SocketEvents['test_alert']) => {
      console.log(`[ALERT] Test alert: ${data.message}`);
      showAlert(data);
    });

    socket.on('display_notification', (data: SocketEvents['display_notification']) => {
      console.log(`[NOTIFICATION] ${data.title || data.message}`);
      showNotification(data);
    });

    socket.on('force_refresh', () => {
      console.log('[DISPLAY] Force refresh received');
      window.location.reload();
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      setConnected(false);
    };
  }, [setConnected, updateOrder, setConfig, addOrder]);

  return {
    socket: socketRef.current,
    isConnected: useKDSStore(state => state.isConnected),
  };
};

// Sound notification functions
const playNotificationSound = (status: string) => {
  if (typeof window === 'undefined') return;
  
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
};

const playBumpSound = () => {
  if (typeof window === 'undefined') return;
  
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
};

// Browser notification functions
const showAlert = (data: SocketEvents['test_alert']) => {
  if (typeof window === 'undefined') return;
  
  // Create toast notification or modal
  console.log('Alert:', data);
  // TODO: Implement toast notification system
};

const showNotification = (data: SocketEvents['display_notification']) => {
  if (typeof window === 'undefined') return;
  
  // Browser notification if permission granted
  if (Notification.permission === 'granted') {
    new Notification(data.title || 'KDS Notification', {
      body: data.message,
      icon: '/favicon.ico',
      tag: data.id,
    });
  }
  
  console.log('Notification:', data);
};