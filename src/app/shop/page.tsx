
"use client";

import React, { useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProductCard } from '@/components/home/ProductCard';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { Search, SlidersHorizontal, Package, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ShopPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  // استعلام مبسط لتجنب مشاكل الفهارس
  const productsQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'products'),
      where('storeId', '==', storeId)
    );
  }, [db, storeId]);

  const { data: rawProducts, loading } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!rawProducts) return [];
    
    // فلترة النشط فقط وبحث النص
    let items = rawProducts.filter((p: any) => p.status !== 'draft');
    
    if (searchTerm) {
      items = items.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // ترتيب برمجي
    if (sortBy === 'price-asc') items.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') items.sort((a, b) => b.price - a.price);
    else items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    
    return items;
  }, [rawProducts, sortBy, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] font-arabic pb-32">
      <Header />
      
      <main className="flex-grow container mx-auto px-5 pt-24 py-6">
        <div className="mb-8">
           <h1 className="text-3xl font-black text-primary dark:text-zinc-100 mb-6 px-2">اكتشفي المجموعة</h1>
           
           <div className="flex gap-3 px-1">
             <div className="relative flex-1 group">
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30 group-focus-within:text-primary transition-colors" />
               <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحثي عن فستان، تنورة..." 
                className="h-14 pr-12 bg-white dark:bg-zinc-900 border-border dark:border-zinc-800 shadow-sm rounded-2xl font-bold dark:text-zinc-100"
               />
             </div>
             <button className="h-14 w-14 bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-2xl flex items-center justify-center text-primary/40 dark:text-zinc-500 shadow-sm active:scale-95 transition-all">
               <SlidersHorizontal className="h-5 w-5" />
             </button>
           </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
             <p className="text-[10px] font-black text-primary/20 uppercase tracking-widest">تنسيق المتجر...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-700">
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
                  badge: product.isNew ? 'جديد' : undefined,
                  stock: product.stock,
                  variants: product.variants
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

        <div className="text-center py-10 opacity-10">
           <p className="text-[9px] font-black uppercase tracking-[0.4em]">NOVA SHOP — 2026</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
