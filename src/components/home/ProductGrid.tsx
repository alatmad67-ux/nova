
'use client';

import React, { useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductGrid() {
  const { storeId } = useStore();
  const db = useFirestore();

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('storeId', '==', storeId)
    );
  }, [db, storeId]);

  const { data: products, loading } = useCollection(productsQuery);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">أحدث المنتجات</h3>
          <p className="text-muted-foreground text-sm mt-1">اكتشف أحدث العروض الحصرية لهذا الأسبوع</p>
        </div>
        <button className="px-4 py-2 border rounded-full text-sm font-medium hover:bg-secondary transition-colors">
          تصفية النتائج
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-[1.5rem]" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product: any) => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                name: product.name,
                category: product.category || 'عام',
                price: product.price.toLocaleString(),
                image: product.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                rating: product.rating || 5.0,
                reviews: product.reviews || 0,
                badge: product.badge
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] shadow-premium">
          <p className="text-slate-400 font-bold">لا توجد منتجات متوفرة لهذا المتجر حالياً.</p>
        </div>
      )}
    </section>
  );
}
