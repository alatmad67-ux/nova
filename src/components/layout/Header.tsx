"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Heart, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from '@/providers/cart-provider';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, favorites } = useCart();
  const db = useFirestore();
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'general') : null, [db]);
  const { data: settings } = useDoc(settingsRef);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-border">
      <div className="bg-accent py-2 text-center border-b border-border/50">
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
          شحن مجاني للطلبات فوق 75,000 د.ع ✨
        </p>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <div className="hidden lg:flex flex-1 max-w-xs">
            <div className="relative w-full group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="ابحثي عن قطعتك..."
                className="w-full h-11 pr-11 bg-accent/50 border-none focus:ring-1 focus:ring-primary/20 text-primary rounded-xl text-sm font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Link href="/" className="flex flex-col items-center group lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            {settings?.logo ? (
              <div className="relative h-12 w-32">
                <Image src={settings.logo} alt="NOVA" fill className="object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-primary tracking-[0.2em]">NOVA</span>
                <span className="text-[8px] font-bold text-secondary uppercase tracking-[0.4em] -mt-1">Women Fashion</span>
              </div>
            )}
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/wishlist" className="hidden md:block">
              <Button variant="ghost" size="icon" className="relative text-primary/60 hover:text-primary hover:bg-accent">
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-secondary rounded-full" />
                )}
              </Button>
            </Link>
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-primary/60 hover:text-primary hover:bg-accent">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white flex items-center justify-center rounded-full text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/admin/login">
              <Button variant="ghost" size="icon" className="text-primary/60 hover:text-primary hover:bg-accent">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <nav className="hidden lg:flex items-center justify-center gap-10 h-12 border-t border-border/30">
          <Link href="/" className="text-[10px] font-black text-primary hover:text-secondary transition-colors uppercase tracking-[0.2em]">الرئيسية</Link>
          <Link href="/shop" className="text-[10px] font-black text-primary/60 hover:text-primary transition-colors uppercase tracking-[0.2em]">الأقسام</Link>
          <Link href="/shop" className="text-[10px] font-black text-primary/60 hover:text-primary transition-colors uppercase tracking-[0.2em]">وصل حديثاً</Link>
          <Link href="/wishlist" className="text-[10px] font-black text-primary/60 hover:text-primary transition-colors uppercase tracking-[0.2em]">المفضلة</Link>
        </nav>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-border shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col p-6 gap-4">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-sm font-black p-2 text-primary">الرئيسية</Link>
            <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="text-sm font-black p-2 text-primary/60">الأقسام</Link>
            <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="text-sm font-black p-2 text-primary/60">المفضلة</Link>
          </div>
        </div>
      )}
    </header>
  );
}
