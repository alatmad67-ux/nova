
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Heart, Menu, X, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from '@/providers/cart-provider';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { STORE_ID } from '@/lib/constants';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, favorites } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'general') : null, [db]);
  const { data: settings } = useDoc(settingsRef);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-border">
      <div className="bg-accent py-2 text-center border-b border-border/50">
        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
          شحن مجاني للطلبات فوق 100,000 د.ع ✨
        </p>
      </div>

      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Logo Left on Mobile, Center on Desktop */}
        <Link href="/" className="flex items-center group lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          {settings?.logo ? (
            <div className="relative h-10 w-24">
              <Image src={settings.logo} alt="NOVA" fill className="object-contain" />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-primary tracking-[0.2em]">NOVA</span>
              <span className="text-[7px] font-bold text-secondary uppercase tracking-[0.4em] -mt-1">Women Fashion</span>
            </div>
          )}
        </Link>

        {/* Hidden Search on Mobile Header (use /search page) */}
        <div className="hidden lg:flex flex-1 max-w-xs">
          <Link href="/search" className="w-full">
            <div className="relative w-full group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
              <div className="w-full h-11 bg-accent/50 text-primary/40 rounded-xl text-xs font-bold flex items-center pr-11">ابحثي عن قطعتك...</div>
            </div>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-5">
          <Link href="/search" className="lg:hidden p-2 text-primary/60"><Search className="h-6 w-6" /></Link>
          
          <Link href="/cart" className="relative p-2 text-primary/60 hover:text-primary transition-all">
            <ShoppingBag className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-white flex items-center justify-center rounded-full text-[9px] font-black shadow-lg">
                {cartCount}
              </span>
            )}
          </Link>

          <Link href="/account" className="p-2 text-primary/60 hover:text-primary transition-all">
            {user?.photoURL ? (
              <Avatar className="h-7 w-7 border border-primary/10">
                <AvatarImage src={user.photoURL} />
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-6 w-6" />
            )}
          </Link>
        </div>
      </div>
      
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center justify-center gap-12 h-12 border-t border-border/30">
        {['الرئيسية', 'الأقسام', 'وصل حديثاً', 'المفضلة'].map((label, idx) => (
          <Link key={idx} href={label === 'المفضلة' ? '/wishlist' : label === 'الأقسام' ? '/categories' : '/'} className="text-[10px] font-black text-primary/60 hover:text-primary transition-colors uppercase tracking-[0.3em]">{label}</Link>
        ))}
      </nav>
    </header>
  );
}
