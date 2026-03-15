'use client';

import React, { useState, useEffect } from 'react';
import { ChefHat, Wifi, WifiOff, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SimpleKanbanHeaderProps {
  newCount: number;
  processCount: number;
  readyCount: number;
  isConnected: boolean;
}

export const SimpleKanbanHeader: React.FC<SimpleKanbanHeaderProps> = ({
  newCount,
  processCount,
  readyCount,
  isConnected,
}) => {
  const totalServed = 0; // For future implementation
  
  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left side - Logo & Restaurant branding */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* AdaKDS Logo */}
            <img 
              src="/icon-192x192.png" 
              alt="AdaKDS Logo" 
              className="w-12 h-12 rounded-lg shadow-sm"
            />
            <div>
              <h1 className="text-gray-900 text-xl font-bold">AdaKDS</h1>
              <p className="text-gray-600 text-sm">Kitchen Display System</p>
            </div>
          </div>
        </div>

        {/* Center - Status counts */}
        <div className="flex items-center space-x-4">
          {/* New Orders Badge */}
          <div className="text-white px-6 py-3 rounded-lg min-w-[120px] text-center" style={{ backgroundColor: '#EF4444' }}>
            <div className="text-2xl font-bold">{newCount}</div>
            <div className="text-sm font-medium">New</div>
          </div>

          {/* Process Orders Badge */}
          <div className="text-white px-6 py-3 rounded-lg min-w-[120px] text-center" style={{ backgroundColor: '#F59E0B' }}>
            <div className="text-2xl font-bold">{processCount}</div>
            <div className="text-sm font-medium">Process</div>
          </div>

          {/* Ready Orders Badge */}
          <div className="text-white px-6 py-3 rounded-lg min-w-[120px] text-center" style={{ backgroundColor: '#10B981' }}>
            <div className="text-2xl font-bold">{readyCount}</div>
            <div className="text-sm font-medium">Ready</div>
          </div>

          {/* Served Counter */}
          <div className="bg-gray-600 text-white px-6 py-3 rounded-lg min-w-[120px] text-center">
            <div className="text-2xl font-bold">{totalServed}</div>
            <div className="text-sm font-medium">Served</div>
          </div>
        </div>

        {/* Right side - Real-time clock and connection status */}
        <div className="flex items-center space-x-6">
          {/* Real-time clock in HH:MM:SS format */}
          <div className="text-gray-900 text-right">
            <div className="text-2xl font-bold font-mono">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </div>
            <div className="text-gray-600 text-sm">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Connection status and settings */}
          <div className="flex items-center space-x-4">
            {/* Connection status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className={cn(
                  "w-5 h-5 text-green-600",
                  isConnected && "animate-pulse"
                )} />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
              <span className={cn(
                "text-sm font-medium",
                isConnected ? "text-green-700" : "text-red-700"
              )}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>

            {/* Settings button */}
            <Link 
              href="/stations"
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Manage Kitchen Stations"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};