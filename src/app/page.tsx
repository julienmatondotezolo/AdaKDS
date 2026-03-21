'use client';

import { ProtectedRoute } from '@/contexts/auth-context';
import { useRestaurant } from '@/contexts/restaurant-context';
import { RestaurantSelector } from '@/components/kds/restaurant-selector';
import { KDSHeader } from '@/components/kds/kds-header';
import { PreciseKDSDisplay } from '@/components/kds/precise-kds-display';

function KDSPage() {
  const { needsSelection } = useRestaurant();

  if (needsSelection) {
    return <RestaurantSelector />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <KDSHeader />
      <PreciseKDSDisplay />
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <KDSPage />
    </ProtectedRoute>
  );
}
