'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Wifi, WifiOff, Clock, TrendingUp, AlertCircle, Users, Bell, Volume2, VolumeX, CheckCircle, ChefHat } from 'lucide-react';
import { Card, Badge, Switch } from 'ada-design-system';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Station, DisplayConfig } from '@/types';

interface ProfessionalKDSHeaderProps {
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

export const ProfessionalKDSHeader: React.FC<ProfessionalKDSHeaderProps> = ({
  isConnected,
  metrics,
  stations,
  config
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
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
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRushLevel = () => {
    const totalActiveOrders = metrics.new + metrics.preparing + metrics.ready;
    if (totalActiveOrders >= 15) return { 
      level: 'extreme', 
      color: 'bg-red-500 text-white', 
      label: 'EXTREME RUSH',
      icon: AlertCircle
    };
    if (totalActiveOrders >= 10) return { 
      level: 'high', 
      color: 'bg-orange-500 text-white', 
      label: 'HIGH RUSH',
      icon: TrendingUp
    };
    if (totalActiveOrders >= 5) return { 
      level: 'moderate', 
      color: 'bg-yellow-500 text-white', 
      label: 'MODERATE',
      icon: TrendingUp
    };
    return { 
      level: 'low', 
      color: 'bg-green-500 text-white', 
      label: 'NORMAL',
      icon: CheckCircle
    };
  };

  const rushLevel = getRushLevel();

  return (
    <div className="bg-white shadow-lg border-b-4 border-ada-500">
      {/* Main Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Branding & Time */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-ada-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🍳</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AdaKDS</h1>
                <p className="text-sm text-gray-600">Kitchen Display System</p>
              </div>
            </div>

            <div className="border-l border-gray-300 pl-6">
              <div className="text-3xl font-mono font-bold text-gray-900 tabular-nums">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Center: Rush Level & Key Metrics */}
          <div className="flex items-center gap-8">
            {/* Rush Level Indicator */}
            <Card className="p-4">
              <div className="text-center">
                <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg', rushLevel.color)}>
                  {React.createElement(rushLevel.icon, { className: 'h-5 w-5' })}
                  {rushLevel.label}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {metrics.new + metrics.preparing + metrics.ready} active orders
                </div>
              </div>
            </Card>

            {/* Overdue Alert */}
            {metrics.overdue > 0 && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-red-500 animate-pulse" />
                  <div>
                    <div className="font-bold text-xl text-red-700">{metrics.overdue}</div>
                    <div className="text-sm text-red-600">Overdue Orders</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{metrics.avgPrepTime.toFixed(1)}m</div>
                <div className="text-xs text-gray-500">Avg Prep Time</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{stations.filter(s => s.active).length}</div>
                <div className="text-xs text-gray-500">Active Stations</div>
              </Card>
            </div>
          </div>

          {/* Right: Controls & Status */}
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <Card className={cn('p-3', {
              'bg-green-50 border-green-200': isConnected,
              'bg-red-50 border-red-200': !isConnected
            })}>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-medium text-sm">LIVE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-red-600" />
                    <span className="text-red-700 font-medium text-sm">OFFLINE</span>
                  </>
                )}
              </div>
            </Card>

            {/* Sound Toggle */}
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="flex items-center gap-2"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </Card>

            {/* Settings */}
            <Button
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
              className="p-3"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Order Status Breakdown */}
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 text-green-800 px-3 py-1 flex items-center gap-1">
                <Bell className="h-3 w-3" /> {metrics.new} New
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1 flex items-center gap-1">
                <ChefHat className="h-3 w-3" /> {metrics.preparing} Preparing
              </Badge>
              <Badge className="bg-red-100 text-red-800 px-3 py-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {metrics.ready} Ready
              </Badge>
              <Badge className="bg-gray-100 text-gray-800 px-3 py-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> {metrics.completed} Completed
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Real-time tracking active</span>
            </div>
            {config && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{config.display_layout.columns} column layout</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-t border-gray-200 p-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Display Settings
            </h3>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                  <option>Dark</option>
                  <option>Light</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sound Alerts</label>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto Refresh</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                  <option>30 seconds</option>
                  <option>60 seconds</option>
                  <option>2 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                  <option>4 Columns</option>
                  <option>3 Columns</option>
                  <option>2 Columns</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};