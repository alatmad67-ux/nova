
'use client';

import React, { useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';

export function ProductGrid() {
  const { storeId } = useStore();
  const db = useFirestore();

  // Fetching REAL products from Firestore
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('storeId', '==', storeId),
      where('status', '==', 'active')
    );
  }, [db, storeId]);

  const { data: products, loading } = useCollection(productsQuery);

  return (
    <section className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-[2.5rem] bg-white/5" />
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
                category: product.categoryName || 'أزياء',
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images?.[0] || 'https://picsum.photos/seed/placeholder/400/600',
                rating: 5.0,
                badge: product.isNew ? 'جديد' : product.isBestSeller ? 'الأكثر مبيعاً' : undefined
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 nova-card celestial-glow">
          <Package className="h-16 w-16 mx-auto mb-6 text-primary opacity-20" />
          <h3 className="text-2xl font-black text-white mb-2">خزينة نوفا فارغة حالياً</h3>
          <p className="text-white/40 font-light">انتظري مجموعتنا الجديدة من التصاميم الفلكية قريباً</p>
        </div>
      )}
    </section>
  );
}
