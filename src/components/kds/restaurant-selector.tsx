'use client';

import { useRestaurant } from '@/contexts/restaurant-context';

export function RestaurantSelector() {
  const { availableRestaurants, selectRestaurant } = useRestaurant();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-md w-full p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Select Restaurant
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          Choose which restaurant kitchen to connect to
        </p>

        <div className="space-y-3">
          {availableRestaurants.map((id) => (
            <button
              key={id}
              onClick={() => selectRestaurant(id)}
              className="w-full px-4 py-4 text-left rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-700">
                {id}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
