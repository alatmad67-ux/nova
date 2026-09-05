
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, Bell } from 'lucide-react';
import { useCart } from '@/providers/cart-provider';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { query, collection, where } from 'firebase/firestore';
import Image from 'next/image';
import { STORE_ID } from '@/lib/constants';

const TRANSPARENT_LOGO_URL = 'https://c.top4top.io/p_39007qwdb0.png';

export function Header() {
  const { cart } = useCart();
  const db = useFirestore();
  const { user } = useUser();

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
    <header className="absolute top-0 left-0 right-0 z-40 w-full h-24 flex items-center bg-transparent">
      <div className="container mx-auto px-6 h-full flex items-center justify-between relative">
        
        {/* Left: Notification Button (White Circle with Shadow) */}
        <Link 
          href="/account/notifications" 
          className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-primary shadow-xl shadow-black/5 active:scale-95 transition-all"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
          {unreadCount > 0 && (
             <span className="absolute top-2 right-2 h-3 w-3 bg-red-500 border-2 border-white rounded-full" />
          )}
        </Link>

        {/* Center: Integrated Transparent Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 w-48 h-16 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image 
              src={TRANSPARENT_LOGO_URL} 
              alt="NOVA Official" 
              fill 
              className="object-contain"
              priority
              data-ai-hint="luxury logo"
            />
          </div>
        </Link>

        {/* Right: Cart Button (White Circle with Shadow) */}
        <Link 
          href="/cart" 
          className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-primary shadow-xl shadow-black/5 active:scale-95 transition-all"
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={2} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white flex items-center justify-center rounded-full text-[9px] font-black border-2 border-white shadow-lg">
              {cartCount}
            </span>
          )}
        </Link>

      </div>
    </header>
  );
}
