'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from './auth-context';
import type { RestaurantInfo } from '@/lib/auth';

interface RestaurantContextType {
  restaurantId: string | null;
  selectRestaurant: (id: string) => boolean;
  needsSelection: boolean;
  availableRestaurants: RestaurantInfo[];
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const restaurantIds = useMemo(() => user?.restaurant_ids ?? [], [user?.restaurant_ids]);
  const restaurants = useMemo(() => user?.restaurants ?? [], [user?.restaurants]);

  // Non-admin users: always auto-select their first assigned restaurant
  // Admin users: must pick if they have multiple restaurants
  const effectiveId = !isAdmin
    ? restaurantIds[0] ?? null
    : restaurantIds.length === 1
      ? restaurantIds[0]
      : selectedId;

  const needsSelection = isAdmin && restaurantIds.length > 1 && !selectedId;

  const selectRestaurant = useCallback((id: string): boolean => {
    // Validate against user's allowed restaurants
    if (!restaurantIds.includes(id)) {
      console.error(`[RESTAURANT] Access denied: user does not have access to ${id}`);
      return false;
    }
    setSelectedId(id);
    return true;
  }, [restaurantIds]);

  return (
    <RestaurantContext.Provider value={{
      restaurantId: effectiveId,
      selectRestaurant,
      needsSelection,
      availableRestaurants: restaurants,
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant(): RestaurantContextType {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
