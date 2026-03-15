'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Wifi, WifiOff, Clock, TrendingUp, AlertTriangle, Users, Activity, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Station, DisplayConfig } from '@/types';

interface ModernKDSHeaderProps {
  isConnected: boolean;
  metrics: {
    total: number;
    new: number;
    preparing: number;
    ready: number;
    completed: number;
    overdue: number;
    avgPrepTime: number;
  } | null;
  stations: Station[];
  config: DisplayConfig | null;
  onConfigClick?: () => void;
}

export const ModernKDSHeader: React.FC<ModernKDSHeaderProps> = ({
  isConnected,
  metrics,
  stations,
  config,
  onConfigClick
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Safe getter for metrics with default values
  const safeMetrics = {
    total: metrics?.total || 0,
    new: metrics?.new || 0,
    preparing: metrics?.preparing || 0,
    ready: metrics?.ready || 0,
    completed: metrics?.completed || 0,
    overdue: metrics?.overdue || 0,
    avgPrepTime: metrics?.avgPrepTime || 0
  };

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
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRushLevel = () => {
    const totalActiveOrders = safeMetrics.new + safeMetrics.preparing + safeMetrics.ready;
    if (totalActiveOrders >= 15) return { 
      level: 'EXTREME', 
      color: 'text-red-400 animate-pulse', 
      bg: 'bg-red-500/20 border-red-500/50',
      icon: '🚨'
    };
    if (totalActiveOrders >= 10) return { 
      level: 'HIGH RUSH', 
      color: 'text-orange-400', 
      bg: 'bg-orange-500/20 border-orange-500/50',
      icon: '⚡'
    };
    if (totalActiveOrders >= 5) return { 
      level: 'MODERATE', 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/20 border-amber-500/50',
      icon: '⚠️'
    };
    return { 
      level: 'NORMAL', 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/20 border-emerald-500/50',
      icon: '✅'
    };
  };

  const rushLevel = getRushLevel();
  const activeStationsCount = stations?.filter(s => s.active).length || 0;

  return (
    <div className="bg-gray-800 border-b-2 border-gray-700 px-8 py-6 shadow-xl">
      {/* Main Header Row */}
      <div className="flex items-center justify-between mb-6">
        {/* Left: Branding & Time */}
        <div className="flex items-center gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-ada-500 to-ada-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">ADA</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Kitchen Display</h1>
              <p className="text-gray-400 font-medium">Real-time order management</p>
            </div>
          </div>

          {/* Time Display */}
          <div className="border-l border-gray-600 pl-8">
            <div className="font-mono text-4xl font-black text-white">
              {formatTime(currentTime)}
            </div>
            <div className="text-lg text-gray-400 font-medium">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>

        {/* Center: Rush Level & Key Metrics */}
        <div className="flex items-center gap-8">
          {/* Rush Level Indicator */}
          <div className={cn(
            'px-6 py-4 rounded-xl border text-center',
            rushLevel.bg
          )}>
            <div className={cn('font-black text-2xl mb-1', rushLevel.color)}>
              {rushLevel.level}
            </div>
            <div className="text-white text-lg font-bold">
              {safeMetrics.new + safeMetrics.preparing + safeMetrics.ready} Active
            </div>
          </div>

          {/* Critical Alerts */}
          {safeMetrics.overdue > 0 && (
            <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl px-6 py-4 animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <div>
                  <div className="font-black text-2xl text-red-400">{safeMetrics.overdue}</div>
                  <div className="text-red-300 font-bold">OVERDUE</div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-black text-3xl text-white">{safeMetrics.avgPrepTime}m</div>
              <div className="text-gray-400 font-bold">Avg Time</div>
            </div>
            <div className="text-center">
              <div className="font-black text-3xl text-white">{activeStationsCount}</div>
              <div className="text-gray-400 font-bold">Stations</div>
            </div>
          </div>
        </div>

        {/* Right: Connection & Controls */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border font-bold', {
            'bg-emerald-500/20 border-emerald-500/50 text-emerald-400': isConnected,
            'bg-red-500/20 border-red-500/50 text-red-400': !isConnected
          })}>
            {isConnected ? (
              <>
                <Wifi className="h-6 w-6" />
                <span className="text-lg">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="h-6 w-6 animate-bounce" />
                <span className="text-lg">OFFLINE</span>
              </>
            )}
          </div>

          {/* Settings Button */}
          <Button
            onClick={onConfigClick}
            className="btn-secondary p-4"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between">
        {/* Order Status Breakdown */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span className="text-emerald-400 font-bold text-lg">{safeMetrics.new} NEW</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
            <span className="text-amber-400 font-bold text-lg">{safeMetrics.preparing} PREPARING</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-bold text-lg">{safeMetrics.ready} READY</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400 font-bold text-lg">{safeMetrics.completed} COMPLETED</span>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-6 text-gray-400">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <span className="font-medium">Performance tracking active</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <span className="font-medium">
              {config?.display_layout?.columns || 4}-column layout
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">Real-time sync: {isConnected ? 'Active' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Connection Warning Banner */}
      {!isConnected && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400 animate-bounce" />
            <div>
              <div className="font-bold text-red-400 text-lg">CONNECTION LOST</div>
              <div className="text-red-300">Orders may not update in real-time. Reconnecting...</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};