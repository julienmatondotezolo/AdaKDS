import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import 'ada-design-system/styles.css';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { RestaurantProvider } from '@/contexts/restaurant-context';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'AdaKDS - Kitchen Display System',
  description: 'Real-time kitchen display system for restaurants. Part of the Ada Systems platform.',
  keywords: ['kds', 'kitchen', 'display', 'restaurant', 'orders', 'ada systems'],
  authors: [{ name: 'Ada Systems' }],
  robots: 'noindex, nofollow', // Private kitchen system
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true, // Allow pinch-to-zoom on tablets
  themeColor: '#4d6aff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_WS_URL} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_AUTH_URL} />
      </head>
      <body 
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <RestaurantProvider>
            <div id="kds-app" className="min-h-screen w-full">
              {children}
            </div>
          </RestaurantProvider>
        </AuthProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(console.error);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}