
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { StoreProvider } from '@/providers/store-provider';
import { initializeFirebase } from '@/firebase';

export const metadata: Metadata = {
  title: 'Nahrain Shop | متجر النهرين',
  description: 'Premium Arabic E-commerce Shopping Experience in Iraq',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // In a real SaaS, storeId would be derived from the hostname/subdomain
  // For the prototype, we use a default ID.
  const mockStoreContext = {
    storeId: 'default-store-id',
    storeName: 'متجر النهرين',
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
      <body className="font-arabic antialiased bg-[#F7F9FC] pb-20 md:pb-0 text-slate-900">
        <FirebaseClientProvider>
          <StoreProvider value={mockStoreContext}>
            {children}
            <Toaster />
          </StoreProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
