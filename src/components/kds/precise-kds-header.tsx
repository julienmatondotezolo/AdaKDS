'use client';

import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Utensils } from 'lucide-react';
import { useRestaurant } from '@/contexts/restaurant-context';
import { useTranslation } from '@/i18n/locale-context';
import Link from 'next/link';

interface PreciseKDSHeaderProps {
  isConnected: boolean;
}

export const PreciseKDSHeader: React.FC<PreciseKDSHeaderProps> = ({ isConnected }) => {
  const { restaurantName } = useRestaurant();
  const { t } = useTranslation();
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
    <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center shrink-0">
            <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Ada KDS</h1>
            {restaurantName && (
              <p className="text-xs sm:text-sm text-gray-500 -mt-0.5 truncate">{restaurantName}</p>
            )}
          </div>
        </div>

        {/* Right: Status, Clock, and Controls */}
        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          {/* LIVE Status */}
          <div className="flex items-center gap-2 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs sm:text-sm font-medium text-green-700">
              {isConnected ? t('header.live') : 'OFFLINE'}
            </span>
          </div>

          {/* Digital Clock — full datetime on sm+, just HH:MM on mobile */}
          <div className="text-right">
            <div className="hidden sm:block text-base font-mono font-medium text-gray-700">
              {formatTime(currentTime)} {formatDate(currentTime)}
            </div>
            <div className="sm:hidden text-sm font-mono font-medium text-gray-700 tabular-nums">
              {currentTime.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Control Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/settings" className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <button onClick={() => window.location.reload()} className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};