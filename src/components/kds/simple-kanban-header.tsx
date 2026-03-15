'use client';

import React from 'react';
import { cn } from '@/lib/utils';

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

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left side - Restaurant branding */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl">🍝</span>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">AdaKDS</h1>
              <p className="text-gray-400 text-sm">Italian Restaurant</p>
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

        {/* Right side - Connection status and time */}
        <div className="flex items-center space-x-4">
          {/* Current time */}
          <div className="text-white text-right">
            <div className="text-xl font-bold">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </div>
            <div className="text-gray-400 text-sm">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Connection status */}
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
            )}></div>
            <span className={cn(
              "text-sm font-medium",
              isConnected ? "text-green-400" : "text-red-400"
            )}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};