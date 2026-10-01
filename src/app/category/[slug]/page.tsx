
"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProductCard } from '@/components/home/ProductCard';
import { useStore } from '@/providers/store-provider';
import { Sparkles, Package, ChevronRight } from 'lucide-react';

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { storeId } = useStore();

  // 1. جلب بيانات القسم بناءً على الـ Slug
  const catQuery = useMemo(() => {
    if (!db || !slug || !storeId) return null;
    return query(
      collection(db, 'categories'),
      where('slug', '==', slug),
      where('storeId', '==', storeId)
    );
  }, [db, slug, storeId]);
  
  const { data: categoryData, loading: catLoading } = useCollection(catQuery);
  const category = categoryData?.[0];

  // 2. جلب المنتجات النشطة للمتجر
  const productsQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'products'),
      where('storeId', '==', storeId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
  }, [db, storeId]);

  const { data: rawProducts, loading: prodsLoading } = useCollection(productsQuery);

  // 3. فلترة المنتجات حسب الـ Category ID المكتشف
  const products = useMemo(() => {
    if (!rawProducts || !category) return [];
    return rawProducts.filter((p: any) => p.categoryId === category?.id);
  }, [rawProducts, category]);

  const isLoading = catLoading || prodsLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] font-arabic pb-32">
      {/* Header المخصص لصفحة القسم */}
      <header className="h-20 flex items-center px-6 justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/30 dark:border-zinc-800">
        <button 
          onClick={() => router.back()} 
          className="h-10 w-10 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-zinc-300"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-black text-primary dark:text-zinc-100 uppercase tracking-widest">
          {category?.name || 'جاري التحميل...'}
        </h1>
        <div className="w-10" />
      </header>
      
      <main className="flex-grow container mx-auto px-5 py-6">
        {/* ترويسة فنية بسيطة */}
        {!isLoading && category && (
          <div className="mb-8 px-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="text-[10px] font-black text-primary/40 dark:text-zinc-500 uppercase tracking-[0.2em]">المجموعة الملكية</span>
            </div>
            <h2 className="text-3xl font-black text-primary dark:text-zinc-100">{category.name}</h2>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-accent dark:bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
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
                  badge: product.isNew ? 'جديد' : undefined,
                  stock: product.stock,
                  variants: product.variants,
                  slug: product.slug
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-primary/10 dark:border-zinc-800">
            <Package className="h-16 w-16 mx-auto mb-6 text-primary opacity-20 dark:text-zinc-700" />
            <h3 className="text-xl font-black text-primary dark:text-zinc-100 mb-2">لا توجد قطع حالياً</h3>
            <p className="text-sm text-primary/40 dark:text-zinc-500 font-bold max-w-[200px] mx-auto leading-relaxed">نحن بصدد إضافة مجموعات جديدة لهذا القسم قريباً، تابعينا!</p>
          </div>
        )}

        {/* علامة تجارية بسيطة في الأسفل بدلاً من التذيل الطويل */}
        <div className="text-center py-10 opacity-20">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] dark:text-zinc-500">NOVA OFFICIAL — EST. 2026</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
