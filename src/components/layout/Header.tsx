
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, Bell, Menu } from 'lucide-react';
import { useCart } from '@/providers/cart-provider';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { query, collection, where } from 'firebase/firestore';
import { STORE_ID } from '@/lib/constants';

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
    <header className="sticky top-0 z-[60] w-full pt-6 pb-4 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Left: Menu & Greeting */}
        <div className="flex items-center gap-4">
          <button className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary active:scale-95 transition-all">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">
              أهلاً، جميلة نوفا ✨
            </span>
            <h1 className="text-xl font-black text-primary tracking-tight leading-none mt-0.5">
              اكتشفي الجمال
            </h1>
            <p className="text-[10px] font-medium text-primary/30">منتجات فاخرة، لكِ وحدكِ</p>
          </div>
        </div>

        {/* Right: Notification & Cart */}
        <div className="flex items-center gap-3">
          <Link 
            href="/account/notifications" 
            className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm active:scale-95 transition-all relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
               <span className="absolute top-3 right-3 h-4 w-4 bg-secondary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">
                 {unreadCount}
               </span>
            )}
          </Link>

          <Link 
            href="/cart" 
            className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm active:scale-95 transition-all"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
        </div>

      </div>
    </header>
  );
}
