
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, Bell } from 'lucide-react';
import { useCart } from '@/providers/cart-provider';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';

export function Header() {
  const { cart } = useCart();
  const db = useFirestore();
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'general') : null, [db]);
  const { data: settings } = useDoc(settingsRef);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border/30 h-20">
      <div className="container mx-auto px-5 h-full flex items-center justify-between relative">
        
        {/* Left: Notification */}
        <button className="h-11 w-11 rounded-full bg-accent flex items-center justify-center text-primary/60 shadow-sm border border-border/20">
          <Bell className="h-5 w-5" />
        </button>

        {/* Center: Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          {settings?.logo ? (
            <div className="relative h-10 w-28">
              <Image src={settings.logo} alt="NOVA" fill className="object-contain" />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-primary tracking-[0.1em]">NOVA</span>
              <span className="text-[7px] font-bold text-secondary uppercase tracking-[0.4em] -mt-1">Women Fashion</span>
            </div>
          )}
        </Link>

        {/* Right: Cart */}
        <Link href="/cart" className="h-11 w-11 rounded-full bg-accent flex items-center justify-center text-primary/60 shadow-sm border border-border/20 relative">
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white flex items-center justify-center rounded-full text-[10px] font-black shadow-lg border-2 border-white">
              {cartCount}
            </span>
          )}
        </Link>

      </div>
    </header>
  );
}
