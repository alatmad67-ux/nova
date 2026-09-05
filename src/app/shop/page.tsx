
"use client";

import React, { useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProductCard } from '@/components/home/ProductCard';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { Sparkles, Filter, LayoutGrid, ListFilter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [sortBy, setSortBy] = useState('newest');

  const productsQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'products'),
      where('storeId', '==', storeId),
      where('status', '==', 'active')
    );
  }, [db, storeId]);

  const { data: rawProducts, loading } = useCollection(productsQuery);

  const products = useMemo(() => {
    if (!rawProducts) return [];
    let items = [...rawProducts];
    
    if (sortBy === 'price-asc') items.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') items.sort((a, b) => b.price - a.price);
    else items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    
    return items;
  }, [rawProducts, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="text-xs font-black text-primary tracking-[0.3em] uppercase">NOVA OFFICIAL STORE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary">المتجر العام</h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex-1 md:w-48 relative">
               <ListFilter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
               <select 
                className="w-full h-12 pr-10 pl-4 bg-accent border-none rounded-xl text-xs font-black text-primary outline-none appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
               >
                 <option value="newest">الأحدث أولاً</option>
                 <option value="price-asc">الأقل سعراً</option>
                 <option value="price-desc">الأعلى سعراً</option>
               </select>
             </div>
             <button className="h-12 px-6 bg-accent rounded-xl text-primary/60 hover:text-primary transition-colors">
               <Filter className="h-5 w-5" />
             </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="aspect-[3/4] rounded-[2.5rem] bg-accent" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product: any) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  name: product.name,
                  category: product.categoryName || '',
                  price: product.price,
                  originalPrice: product.originalPrice,
                  image: product.images?.[0] || 'https://picsum.photos/seed/placeholder/400/600',
                  rating: 5.0,
                  badge: product.isNew ? 'جديد' : undefined
                }} 
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
