
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, Bell } from 'lucide-react';
import { useCart } from '@/providers/cart-provider';
import { useDoc, useFirestore, useUser, useCollection } from '@/firebase';
import { doc, query, collection, where } from 'firebase/firestore';
import Image from 'next/image';
import { STORE_ID } from '@/lib/constants';

const NEW_LOGO_URL = 'https://c.top4top.io/p_39007qwdb0.png';

export function Header() {
  const { cart } = useCart();
  const db = useFirestore();
  const { user } = useUser();
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'general') : null, [db]);
  const { data: settings } = useDoc(settingsRef);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const notifyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false),
      where('storeId', '==', STORE_ID)
    );
  }, [db, user]);

  const { data: unreadNotifications } = useCollection(notifyQuery);
  const unreadCount = unreadNotifications?.length || 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl h-24 flex items-center">
      <div className="container mx-auto px-6 h-full flex items-center justify-between relative">
        
        {/* Left: Notification - Styled as White Circle like the image */}
        <Link 
          href="/account/notifications" 
          className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-primary shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-white relative active:scale-95 transition-all"
        >
          <Bell className="h-6 w-6 fill-current" />
          {unreadCount > 0 && (
             <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-red-500 border-2 border-white rounded-full animate-bounce" />
          )}
        </Link>

        {/* Center: Logo - Large as per image */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 w-48 h-16">
          <div className="relative w-full h-full">
            <Image 
              src={settings?.logo || NEW_LOGO_URL} 
              alt="البشرة الزجاجية" 
              fill 
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Right: Cart - Styled as White Circle like the image */}
        <Link 
          href="/cart" 
          className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-primary shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-white relative active:scale-95 transition-all"
        >
          <ShoppingBag className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 bg-primary text-white flex items-center justify-center rounded-full text-[10px] font-black shadow-lg border-2 border-white">
              {cartCount}
            </span>
          )}
        </Link>

      </div>
    </header>
  );
}
