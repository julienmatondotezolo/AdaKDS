'use client';

import { ProtectedRoute } from '@/contexts/auth-context';
import { KDSHeader } from '@/components/kds/kds-header';
import { PreciseKDSDisplay } from '@/components/kds/precise-kds-display';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <KDSHeader />
        <PreciseKDSDisplay />
      </div>
    </ProtectedRoute>
  );
}