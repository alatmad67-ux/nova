
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { StoreProvider } from '@/providers/store-provider';
import { CartProvider } from '@/providers/cart-provider';
import { InstallPrompt } from '@/components/layout/InstallPrompt';

export const metadata: Metadata = {
  title: 'NOVA | أزياء نسائية فاخرة',
  description: 'نوفا للأزياء النسائية الفاخرة - تصاميم حصرية تناسب ذوقكِ الرفيع في العراق',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NOVA Fashion',
  },
};

export const viewport: Viewport = {
  themeColor: '#4c1d95',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="NOVA" />
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
      </body>
    </html>
  );
}
