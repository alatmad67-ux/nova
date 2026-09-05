
"use client";

import React, { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSlider } from '@/components/home/HeroSlider';
import { Categories } from '@/components/home/Categories';
import { ProductGrid } from '@/components/home/ProductGrid';
import { BottomNav } from '@/components/layout/BottomNav';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Truck, 
  Heart, 
  MessageCircle, 
  Star 
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import Link from 'next/link';

export default function Home() {
  const { user } = useUser();
  const db = useFirestore();
  const profileRef = useMemo(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef);

  return (
    <div className="min-h-screen flex flex-col relative bg-background font-arabic pb-32">
      <Header />
      
      <main className="flex-grow space-y-6">
        {/* Greeting Section */}
        <section className="container mx-auto px-5 pt-4">
          <p className="text-primary/40 text-sm font-bold">أهلاً، {profile?.displayName || user?.displayName || 'جميلة نوفا'}</p>
        </section>

        {/* Search Bar Section */}
        <section className="container mx-auto px-5">
          <div className="flex items-center gap-3">
            <Link href="/search" className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </Link>
            <Link href="/search" className="flex-1">
              <div className="relative group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
                <div className="h-12 w-full bg-white border border-border/50 rounded-2xl flex items-center pr-12 text-sm text-primary/30 font-bold shadow-sm">
                  ابحثي عن منتج...
                </div>
              </div>
            </Link>
          </div>
        </section>
        
        {/* Categories Section */}
        <Categories />

        {/* Hero Slider Section */}
        <HeroSlider />

        {/* Trust Features Section */}
        <section className="container mx-auto px-5 grid grid-cols-4 gap-2 py-4">
          {[
            { label: 'منتجات أصلية', icon: ShieldCheck },
            { label: 'شحن سريع وآمن', icon: Truck },
            { label: 'عناية مدروسة', icon: Star },
            { label: 'دعم واستشارة', icon: MessageCircle },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-accent border border-border/40 flex items-center justify-center text-primary/60">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[9px] font-black text-primary/60 leading-tight">{item.label}</span>
            </div>
          ))}
        </section>

        {/* Featured Section Header */}
        <section className="container mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-primary">المميزة</h2>
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
          <Link href="/shop" className="text-xs font-bold text-primary/40">عرض الكل</Link>
        </section>

        {/* Products Grid */}
        <ProductGrid />
      </main>

      <BottomNav />
    </div>
  );
}
