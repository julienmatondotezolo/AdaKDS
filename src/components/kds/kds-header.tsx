'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Wifi, WifiOff, Clock, TrendingUp, AlertCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Station, DisplayConfig } from '@/types';

interface KDSHeaderProps {
  isConnected: boolean;
  metrics: {
    total: number;
    new: number;
    preparing: number;
    ready: number;
    completed: number;
    overdue: number;
    avgPrepTime: number;
  };
  stations: Station[];
  config: DisplayConfig | null;
}

export const KDSHeader: React.FC<KDSHeaderProps> = ({
  isConnected,
  metrics,
  stations,
  config
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRushLevel = () => {
    const totalActiveOrders = metrics.new + metrics.preparing + metrics.ready;
    if (totalActiveOrders >= 15) return { level: 'extreme', color: 'text-red-500', label: 'EXTREME RUSH' };
    if (totalActiveOrders >= 10) return { level: 'high', color: 'text-orange-500', label: 'HIGH RUSH' };
    if (totalActiveOrders >= 5) return { level: 'moderate', color: 'text-yellow-500', label: 'MODERATE' };
    return { level: 'low', color: 'text-green-500', label: 'NORMAL' };
  };

  const rushLevel = getRushLevel();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Branding & Time */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-ada-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🍳</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AdaKDS</h1>
              <p className="text-sm text-gray-500">Kitchen Display System</p>
            </div>
          </div>

          <div className="border-l border-gray-300 pl-6">
            <div className="text-2xl font-mono font-bold text-gray-900">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>

        {/* Center: Rush Level & Key Metrics */}
        <div className="flex items-center gap-8">
          {/* Rush Level */}
          <div className="text-center">
            <div className={cn('font-bold text-lg', rushLevel.color)}>
              {rushLevel.label}
            </div>
            <div className="text-sm text-gray-500">
              {metrics.new + metrics.preparing + metrics.ready} active orders
            </div>
          </div>

          {/* Overdue Alert */}
          {metrics.overdue > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="h-5 w-5 text-red-500 animate-bounce-subtle" />
              <div>
                <div className="font-bold text-red-700">{metrics.overdue} Overdue</div>
                <div className="text-sm text-red-600">Orders need attention</div>
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg text-gray-900">{metrics.avgPrepTime}m</div>
              <div className="text-gray-500">Avg Time</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-gray-900">{stations.filter(s => s.active).length}</div>
              <div className="text-gray-500">Stations</div>
            </div>
          </div>
        </div>

        {/* Right: Status & Controls */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', {
            'bg-green-50 border border-green-200': isConnected,
            'bg-red-50 border border-red-200': !isConnected
          })}>
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium text-sm">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span className="text-red-700 font-medium text-sm">Disconnected</span>
              </>
            )}
          </div>

          {/* Settings Button */}
          <Button
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Order Status Breakdown */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-status-new rounded-full"></div>
              <span className="font-medium">{metrics.new} New</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-status-preparing rounded-full"></div>
              <span className="font-medium">{metrics.preparing} Preparing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-status-ready rounded-full"></div>
              <span className="font-medium">{metrics.ready} Ready</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-status-completed rounded-full"></div>
              <span className="font-medium">{metrics.completed} Completed</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Performance tracking active</span>
          </div>
          {config && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{config.display_layout.columns} column layout</span>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3">Quick Settings</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <label className="block text-gray-600 mb-1">Theme</label>
              <select className="w-full p-1 border border-gray-300 rounded text-xs">
                <option>Dark</option>
                <option>Light</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Sound</label>
              <input type="checkbox" defaultChecked className="mt-1" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Auto Refresh</label>
              <select className="w-full p-1 border border-gray-300 rounded text-xs">
                <option>30s</option>
                <option>60s</option>
                <option>2m</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Layout</label>
              <select className="w-full p-1 border border-gray-300 rounded text-xs">
                <option>4 Columns</option>
                <option>3 Columns</option>
                <option>2 Columns</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};