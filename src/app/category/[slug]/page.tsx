
"use client";

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProductCard } from '@/components/home/ProductCard';
import { useStore } from '@/providers/store-provider';
import { Sparkles, Package } from 'lucide-react';

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const db = useFirestore();
  const { storeId } = useStore();

  // 1. Fetch Categories to find the one matching slug (to get its name)
  const catQuery = useMemo(() => query(
    collection(db, 'categories'),
    where('slug', '==', slug),
    where('storeId', '==', storeId)
  ), [db, slug, storeId]);
  
  const { data: categoryData } = useCollection(catQuery);
  const category = categoryData?.[0];

  // 2. Fetch Products for this category
  // Using client-side filter for slug if needed, or if stored as categoryId
  const productsQuery = useMemo(() => query(
    collection(db, 'products'),
    where('storeId', '==', storeId),
    where('status', '==', 'active')
  ), [db, storeId]);

  const { data: rawProducts, loading } = useCollection(productsQuery);

  const products = useMemo(() => {
    if (!rawProducts || !slug) return [];
    // Filter by slug (assuming products have categoryId or categorySlug)
    // Here we'll filter by categoryName or categoryId matching our found category
    return rawProducts
      .filter((p: any) => p.categoryId === category?.id)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [rawProducts, category, slug]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-secondary" />
            <span className="text-xs font-black text-primary tracking-[0.3em] uppercase">NOVA COLLECTION</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-primary mb-6">
            {category?.name || 'استكشاف المجموعة'}
          </h1>
          <div className="h-1 w-20 bg-secondary rounded-full" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[3/4] rounded-[2rem] bg-accent animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
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
        ) : (
          <div className="text-center py-32 bg-accent rounded-[3rem] border border-border/50">
            <Package className="h-16 w-16 mx-auto mb-6 text-primary opacity-20" />
            <h3 className="text-2xl font-black text-primary mb-2">لا توجد قطع حالياً</h3>
            <p className="text-primary/40 font-medium">نحن بصدد إضافة مجموعات جديدة لهذا القسم قريباً</p>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
