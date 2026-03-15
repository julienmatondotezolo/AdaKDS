import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'ada-design-system/dist/style.css';
import './globals.css';

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
  viewport: 'width=device-width, initial-scale=1, user-scalable=no',
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
      </head>
      <body 
        className={`${inter.className} antialiased overflow-hidden`}
        suppressHydrationWarning
      >
        <div id="kds-app" className="h-screen w-screen overflow-hidden">
          {children}
        </div>
        
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