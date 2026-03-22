'use client';

import { ProtectedRoute } from '@/contexts/auth-context';
import { useRestaurant } from '@/contexts/restaurant-context';
import { RestaurantSelector } from '@/components/kds/restaurant-selector';
import { PreciseKDSDisplay } from '@/components/kds/precise-kds-display';

function KDSPage() {
  const { needsSelection } = useRestaurant();

  if (needsSelection) {
    return <RestaurantSelector />;
  }

  return <PreciseKDSDisplay />;
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <KDSPage />
    </ProtectedRoute>
  );
}
