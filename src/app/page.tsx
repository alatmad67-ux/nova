
"use client";

import React, { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSlider } from '@/components/home/HeroSlider';
import { Categories } from '@/components/home/Categories';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { BottomNav } from '@/components/layout/BottomNav';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  Star 
} from 'lucide-react';
import Link from 'next/link';
import { STORE_ID } from '@/lib/constants';

export default function Home() {
  const { user } = useUser();
  const db = useFirestore();
  
  const profileRef = useMemo(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef);

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('storeId', '==', STORE_ID),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
  }, [db]);

  const { data: products } = useCollection(productsQuery);

  const fashionProducts = useMemo(() => 
    products?.filter(p => p.mainCategory === 'fashion').slice(0, 6) || [], 
  [products]);

  const skincareProducts = useMemo(() => 
    products?.filter(p => p.mainCategory === 'skincare').slice(0, 6) || [], 
  [products]);

  const accessoriesProducts = useMemo(() => 
    products?.filter(p => p.mainCategory === 'accessories').slice(0, 6) || [], 
  [products]);

  const devicesProducts = useMemo(() => 
    products?.filter(p => p.mainCategory === 'beauty-devices').slice(0, 6) || [], 
  [products]);

  return (
    <div className="min-h-screen flex flex-col relative bg-background font-arabic pb-32" dir="rtl">
      <Header />
      
      <main className="flex-grow space-y-8">
        {/* Top Greeting & Search */}
        <div className="space-y-4 pt-4">
          <section className="container mx-auto px-5">
            <p className="text-primary/40 text-sm font-bold">أهلاً، {profile?.displayName || user?.displayName || 'جميلة نوفا'}</p>
          </section>

          <section className="container mx-auto px-5">
            <div className="flex items-center gap-3">
              <Link href="/search" className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Sparkles className="h-5 w-5" />
              </Link>
              <Link href="/search" className="flex-1">
                <div className="relative group">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
                  <div className="h-12 w-full bg-white border border-border/50 rounded-2xl flex items-center pr-12 text-sm text-primary/30 font-bold shadow-sm">
                    عن ماذا تبحثين اليوم؟
                  </div>
                </div>
              </Link>
            </div>
          </section>
        </div>

        {/* Hero Section */}
        <HeroSlider />
        
        {/* Horizontal Categories */}
        <Categories />

        {/* Trust Features */}
        <section className="container mx-auto px-5 grid grid-cols-4 gap-2">
          {[
            { label: 'منتجات أصلية', icon: ShieldCheck },
            { label: 'شحن آمن', icon: Truck },
            { label: 'عناية فائقة', icon: Star },
            { label: 'دعم مباشر', icon: MessageCircle },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-accent border border-border/40 flex items-center justify-center text-primary/60">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[9px] font-black text-primary/60 leading-tight">{item.label}</span>
            </div>
          ))}
        </section>

        {/* Main Sections */}
        <div className="space-y-12">
          <ProductCarousel 
            title="الأزياء والملابس" 
            products={fashionProducts} 
            viewAllHref="/category/fashion" 
          />
          
          <ProductCarousel 
            title="العناية بالبشرة" 
            products={skincareProducts} 
            viewAllHref="/category/skincare" 
          />

          <ProductCarousel 
            title="الأكسسوارات" 
            products={accessoriesProducts} 
            viewAllHref="/category/accessories" 
          />

          <ProductCarousel 
            title="أجهزة العناية" 
            products={devicesProducts} 
            viewAllHref="/category/beauty-devices" 
          />
        </div>

        {/* Minimal Footer Info */}
        <div className="text-center pt-8 opacity-20 pb-4">
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">NOVA Women Store © 2026</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
