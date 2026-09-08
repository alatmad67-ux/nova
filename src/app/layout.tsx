
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { StoreProvider } from '@/providers/store-provider';
import { CartProvider } from '@/providers/cart-provider';
import { InstallPrompt } from '@/components/layout/InstallPrompt';
import Script from 'next/script';

// الرابط الرسمي للشعار المفرغ المعتمد في NOVA
const LOGO_URL = 'https://c.top4top.io/p_39007qwdb0.png';

export const metadata: Metadata = {
  title: 'NOVA | أزياء نسائية فاخرة',
  description: 'نوفا للأزياء النسائية الفاخرة - تصاميم حصرية تناسب ذوقكِ الرفيع في العراق',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: LOGO_URL },
      { url: LOGO_URL, sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: LOGO_URL },
      { url: LOGO_URL, sizes: '152x152', type: 'image/png' },
      { url: LOGO_URL, sizes: '167x167', type: 'image/png' },
      { url: LOGO_URL, sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NOVA',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#4c1d95',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const novaStoreContext = {
    storeId: 'nova-official',
    storeName: 'NOVA',
    isMerchant: false,
    isSuperAdmin: false
  };

  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Apple PWA Specific Tags - Explicitly defined for Safari */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="NOVA" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* High-priority apple-touch-icon links */}
        <link rel="apple-touch-icon" href={LOGO_URL} />
        <link rel="apple-touch-icon" sizes="152x152" href={LOGO_URL} />
        <link rel="apple-touch-icon" sizes="180x180" href={LOGO_URL} />
        <link rel="apple-touch-icon" sizes="167x167" href={LOGO_URL} />
        
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-arabic antialiased selection:bg-primary/30 selection:text-white overflow-x-hidden bg-background text-foreground min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <StoreProvider value={novaStoreContext}>
            <CartProvider>
              <div className="flex-grow flex flex-col relative">
                {children}
              </div>
              <InstallPrompt />
              <Toaster />
            </CartProvider>
          </StoreProvider>
        </FirebaseClientProvider>

        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('NOVA ServiceWorker registered');
                }, function(err) {
                  console.log('NOVA ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
