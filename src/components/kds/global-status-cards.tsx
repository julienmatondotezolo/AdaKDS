'use client';

import React from 'react';
import { Bell, Flame, CheckCircle, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/locale-context';

interface GlobalStatusCardsProps {
  newCount: number;
  processCount: number;
  readyCount: number;
  servedCount: number;
}

export const GlobalStatusCards: React.FC<GlobalStatusCardsProps> = ({
  newCount,
  processCount,
  readyCount,
  servedCount,
}) => {
  const { t } = useTranslation();
  const cards = [
    {
      label: t('columns.new'),
      count: newCount,
      borderColor: 'border-t-[#3B82F6]',
      bgColor: 'bg-blue-50',
      icon: <Bell className="w-5 h-5 text-blue-500" />,
    },
    {
      label: t('columns.process'),
      count: processCount,
      borderColor: 'border-t-[#F97316]',
      bgColor: 'bg-orange-50',
      icon: <Flame className="w-5 h-5 text-orange-500" />,
    },
    {
      label: t('columns.ready'),
      count: readyCount,
      borderColor: 'border-t-[#22C55E]',
      bgColor: 'bg-green-50',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      label: t('columns.served'),
      count: servedCount,
      borderColor: 'border-t-[#1E40AF]',
      bgColor: 'bg-blue-50',
      icon: <Utensils className="w-5 h-5 text-blue-600" />,
    },
  ];

  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={cn(
              'bg-white rounded-lg border border-gray-200 border-t-4 p-6 shadow-sm',
              card.borderColor
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {card.count}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {card.label}
                </div>
              </div>
              <div className={cn('p-3 rounded-lg', card.bgColor)}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};