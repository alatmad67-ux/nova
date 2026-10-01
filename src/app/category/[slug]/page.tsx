
"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProductCard } from '@/components/home/ProductCard';
import { useStore } from '@/providers/store-provider';
import { Sparkles, Package, ChevronRight, Loader2, LayoutGrid } from 'lucide-react';
import { STORE_ID } from '@/lib/constants';

/**
 * صفحة عرض منتجات قسم معين - نسخة فائقة الاستقرار.
 * تعتمد على الفلترة البرمجية لتجنب مشاكل الفهارس (Firestore Indexes).
 */
export default function CategoryProductsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { storeId } = useStore();

  // 1. جلب كافة الأقسام لهذا المتجر (استعلام بسيط جداً لا يحتاج فهارس)
  const catsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), where('storeId', '==', STORE_ID));
  }, [db]);
  
  const { data: allCategories, loading: catsLoading } = useCollection(catsQuery);

  // 2. تحديد القسم المطلوب من القائمة المحملة
  const category = useMemo(() => {
    if (!allCategories || !slug) return null;
    return allCategories.find((c: any) => c.slug === slug);
  }, [allCategories, slug]);

  // 3. جلب كافة منتجات المتجر (استعلام بسيط جداً)
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), where('storeId', '==', STORE_ID));
  }, [db]);

  const { data: rawProducts, loading: prodsLoading } = useCollection(productsQuery);

  // 4. فلترة المنتجات برمجياً بناءً على القسم والحالة
  const products = useMemo(() => {
    if (!rawProducts || !category) return [];
    
    return rawProducts
      .filter((p: any) => {
        const matchesCategory = p.categoryId === category.id;
        const isActive = p.status !== 'draft';
        return matchesCategory && isActive;
      })
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
  }, [rawProducts, category]);

  const isLoading = catsLoading || prodsLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] font-arabic pb-32" dir="rtl">
      <header className="h-20 flex items-center px-6 justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/30 dark:border-zinc-800">
        <button 
          onClick={() => router.back()} 
          className="h-10 w-10 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-zinc-300 shadow-sm"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <h1 className="text-sm font-black text-primary dark:text-zinc-100 uppercase tracking-widest">
          {category?.name || 'تصفح القسم'}
        </h1>
        <div className="w-10" />
      </header>
      
      <main className="flex-grow container mx-auto px-5 py-6">
        {!isLoading && category && (
          <div className="mb-8 px-2 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="text-[10px] font-black text-primary/40 dark:text-zinc-500 uppercase tracking-[0.2em]">المجموعة الملكية</span>
            </div>
            <h2 className="text-3xl font-black text-primary dark:text-zinc-100">{category.name}</h2>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
            <p className="text-xs font-black text-primary/20">جاري جرد القطع...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {products.map((product: any) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  name: product.name,
                  category: product.categoryName || category?.name || '',
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
          <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-primary/10 dark:border-zinc-800 animate-in zoom-in-95">
            <Package className="h-16 w-16 mx-auto mb-6 text-primary opacity-20 dark:text-zinc-700" />
            <h3 className="text-xl font-black text-primary dark:text-zinc-100 mb-2">لا توجد قطع حالياً</h3>
            <p className="text-sm text-primary/40 dark:text-zinc-500 font-bold max-w-[200px] mx-auto leading-relaxed">بانتظار إضافة مجموعات جديدة لهذا القسم، تابعينا!</p>
          </div>
        )}

        <div className="text-center py-10 opacity-20 mt-10">
           <p className="text-[9px] font-black uppercase tracking-[0.4em] dark:text-zinc-500">NOVA OFFICIAL — EST. 2026</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
