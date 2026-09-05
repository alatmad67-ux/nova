
"use client";

import React, { useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProductCard } from '@/components/home/ProductCard';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { Search, Filter, ListFilter, SlidersHorizontal, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export default function ShopPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const productsQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'products'),
      where('storeId', '==', storeId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
  }, [db, storeId]);

  const { data: rawProducts, loading } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!rawProducts) return [];
    let items = [...rawProducts];
    
    if (searchTerm) {
      items = items.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (sortBy === 'price-asc') items.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') items.sort((a, b) => b.price - a.price);
    
    return items;
  }, [rawProducts, sortBy, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32">
      <Header />
      
      <main className="flex-grow container mx-auto px-5 py-6">
        {/* Mobile App Header Style */}
        <div className="mb-8">
           <h1 className="text-3xl font-black text-primary mb-6">اكتشفي المجموعة</h1>
           
           <div className="flex gap-3">
             <div className="relative flex-1 group">
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30 group-focus-within:text-primary transition-colors" />
               <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحثي عن فستان، تنورة..." 
                className="h-14 pr-12 bg-white border-border shadow-sm rounded-2xl font-bold"
               />
             </div>
             <button className="h-14 w-14 bg-white border border-border rounded-2xl flex items-center justify-center text-primary/40 shadow-sm">
               <SlidersHorizontal className="h-5 w-5" />
             </button>
           </div>
        </div>

        {/* Filters & Sorting */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto no-scrollbar py-1">
          <div className="flex gap-2">
            {['الكل', 'فساتين', 'بناطيل', 'بلوزات'].map(cat => (
              <button key={cat} className="px-5 py-2.5 rounded-xl bg-white border border-border text-xs font-black text-primary/60 whitespace-nowrap active:bg-primary active:text-white transition-all">
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-accent animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product: any) => (
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
        ) : (
          <div className="text-center py-32 opacity-20">
            <Package className="h-16 w-16 mx-auto mb-4" />
            <p className="font-black">لا توجد منتجات مطابقة</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
