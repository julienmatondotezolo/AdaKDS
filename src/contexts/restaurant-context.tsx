'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from './auth-context';

interface RestaurantContextType {
  restaurantId: string | null;
  selectRestaurant: (id: string) => boolean;
  needsSelection: boolean;
  availableRestaurants: string[];
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const restaurants = useMemo(() => user?.restaurant_ids ?? [], [user?.restaurant_ids]);

  // Auto-select if user has exactly one restaurant
  const effectiveId = restaurants.length === 1
    ? restaurants[0]
    : selectedId;

  const needsSelection = restaurants.length > 1 && !selectedId;

  const selectRestaurant = useCallback((id: string): boolean => {
    // Validate against user's allowed restaurants
    if (!restaurants.includes(id)) {
      console.error(`[RESTAURANT] Access denied: user does not have access to ${id}`);
      return false;
    }
    setSelectedId(id);
    return true;
  }, [restaurants]);

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
