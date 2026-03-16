"use client";

import Navigation from './navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  className?: string;
}

export default function AppLayout({ 
  children, 
  showNavigation = true,
  className = ""
}: AppLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {showNavigation && <Navigation />}
      <main className={showNavigation ? "pt-0" : ""}>
        {children}
      </main>
    </div>
  );
}