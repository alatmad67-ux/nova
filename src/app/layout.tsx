
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { StoreProvider } from '@/providers/store-provider';

export const metadata: Metadata = {
  title: 'NOVA | أزياء نسائية فاخرة',
  description: 'Nova Women Fashion - متجر الأزياء النسائية الفاخرة في العراق',
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
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-arabic antialiased selection:bg-primary/30 selection:text-white">
        <FirebaseClientProvider>
          <StoreProvider value={novaStoreContext}>
            {children}
            <Toaster />
          </StoreProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
