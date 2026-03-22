'use client';

import { useState, useMemo } from 'react';
import { useRestaurant } from '@/contexts/restaurant-context';
import { Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from 'ada-design-system';
import { Search, ChefHat } from 'lucide-react';

export function RestaurantSelector() {
  const { availableRestaurants, selectRestaurant } = useRestaurant();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return availableRestaurants;
    const q = search.toLowerCase();
    return availableRestaurants.filter((r) =>
      r.name.toLowerCase().includes(q)
    );
  }, [availableRestaurants, search]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Select Restaurant</CardTitle>
          <CardDescription>
            Choose which restaurant kitchen to connect to
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search restaurant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No restaurants found
              </p>
            ) : (
              filtered.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => selectRestaurant(restaurant.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                >
                  <ChefHat className="h-5 w-5 text-gray-400 group-hover:text-blue-600 shrink-0" />
                  <span className="font-medium text-gray-900 group-hover:text-blue-700 truncate">
                    {restaurant.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
