'use client';

import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Utensils } from 'lucide-react';

interface PreciseKDSHeaderProps {
  isConnected: boolean;
}

export const PreciseKDSHeader: React.FC<PreciseKDSHeaderProps> = ({ isConnected }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Ada KDS</h1>
        </div>

        {/* Right: Status, Clock, and Controls */}
        <div className="flex items-center gap-6">
          {/* LIVE Status */}
          <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-green-700">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* Digital Clock */}
          <div className="text-right">
            <div className="text-base font-mono font-medium text-gray-700">
              {formatTime(currentTime)} {formatDate(currentTime)}
            </div>
          </div>
          
          {/* Control Icons */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};