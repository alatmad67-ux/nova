
"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProductCard } from '@/components/home/ProductCard';
import { STORE_ID } from '@/lib/constants';
import { ChevronRight, Loader2, Package, Sparkles } from 'lucide-react';

/**
 * صفحة عرض منتجات القسم - الإصلاح الجذري V3
 * تضمن ظهور المنتجات من خلال مطابقة ID القسم واسمه وفك ترميز الروابط العربية.
 */
export default function CategoryProductsPage() {
  const params = useParams();
  // فك ترميز الـ Slug العربي لضمان المطابقة (مثلاً: فساتين بدلاً من %D9%81...)
  const slug = useMemo(() => {
    try {
      return params?.slug ? decodeURIComponent(params.slug as string) : '';
    } catch {
      return params?.slug as string || '';
    }
  }, [params?.slug]);

  const router = useRouter();
  const db = useFirestore();

  // 1. جلب كافة الأقسام (استعلام خفيف جداً)
  const catsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), where('storeId', '==', STORE_ID));
  }, [db]);
  const { data: allCategories, loading: catsLoading } = useCollection(catsQuery);

  // 2. جلب كافة منتجات المتجر (لضمان تخطي مشاكل الفهارس المركبة)
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), where('storeId', '==', STORE_ID));
  }, [db]);
  const { data: allProducts, loading: prodsLoading } = useCollection(productsQuery);

  // 3. منطق المطابقة الذكي
  const result = useMemo(() => {
    if (!allCategories || !slug) return { category: null, products: [] };

    // البحث عن القسم بواسطة الـ Slug
    const foundCat = allCategories.find((c: any) => 
      c.slug?.toLowerCase() === slug.toLowerCase() || 
      c.name?.toLowerCase() === slug.toLowerCase()
    );

    if (!foundCat) return { category: null, products: [] };

    // فلترة المنتجات: مطابقة المعرف ID أو اسم القسم (Fallback)
    const filtered = (allProducts || []).filter((p: any) => {
      const isIdMatch = p.categoryId === foundCat.id;
      const isNameMatch = p.categoryName === foundCat.name;
      const isActive = p.status === 'active';
      return isActive && (isIdMatch || isNameMatch);
    });

    // ترتيب من الأحدث للأقدم
    filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    return { category: foundCat, products: filtered };
  }, [allCategories, allProducts, slug]);

  const isLoading = catsLoading || prodsLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] font-arabic pb-32" dir="rtl">
      {/* Header */}
      <header className="h-20 flex items-center px-6 justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/30 dark:border-zinc-800">
        <button 
          onClick={() => router.back()} 
          className="h-10 w-10 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-zinc-300 shadow-sm active:scale-95 transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <h1 className="text-sm font-black text-primary dark:text-zinc-100 uppercase tracking-widest">
          {result.category?.name || 'تصفح القسم'}
        </h1>
        <div className="w-10" />
      </header>
      
      <main className="flex-grow container mx-auto px-5 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
            <p className="text-[10px] font-black text-primary/20 uppercase tracking-[0.2em]">جاري مزامنة المجموعات...</p>
          </div>
        ) : result.category ? (
          <>
            <div className="mb-10 px-2 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 text-secondary" />
                <span className="text-[10px] font-black text-primary/40 dark:text-zinc-500 uppercase tracking-[0.2em]">المجموعة المختارة</span>
              </div>
              <h2 className="text-4xl font-black text-primary dark:text-zinc-100">{result.category.name}</h2>
              <div className="h-1 w-12 bg-secondary mt-4 rounded-full" />
            </div>

            {result.products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {result.products.map((product: any) => (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      id: product.id,
                      name: product.name,
                      category: product.categoryName || result.category?.name || '',
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
              <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[3.5rem] border-2 border-dashed border-primary/10 dark:border-zinc-800 animate-in zoom-in-95 duration-500">
                <Package className="h-16 w-16 mx-auto mb-6 text-primary opacity-10 dark:text-zinc-700" />
                <h3 className="text-xl font-black text-primary dark:text-zinc-100 mb-2">لا توجد قطع حالياً</h3>
                <p className="text-sm text-primary/40 dark:text-zinc-500 font-bold max-w-[200px] mx-auto leading-relaxed">القسم قيد التحديث، سيتم إضافة قطع جديدة قريباً جداً.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-red-100 dark:border-red-900/10">
             <Package className="h-16 w-16 mx-auto mb-6 text-red-200" />
             <h3 className="text-xl font-black text-primary dark:text-zinc-100">عذراً، القسم غير متاح</h3>
             <p className="text-sm text-primary/40 dark:text-zinc-500 mt-2">قد يكون الرابط غير صحيح أو تم تغيير اسم القسم.</p>
             <button onClick={() => router.push('/')} className="mt-8 text-secondary font-black text-xs underline underline-offset-4 uppercase tracking-widest">العودة للرئيسية</button>
          </div>
        )}

        {/* Minimal Mobile Branding - No Long Footer */}
        <div className="text-center py-12 opacity-20 mt-10">
           <p className="text-[9px] font-black uppercase tracking-[0.4em] dark:text-zinc-500">NOVA OFFICIAL — EST. 2026</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
