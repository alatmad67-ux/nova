
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { Sparkles, ChevronLeft, LayoutGrid } from 'lucide-react';

export default function CategoriesPage() {
  const db = useFirestore();
  const { storeId } = useStore();

  // جلب المجموعات الكبرى ديناميكياً من Firestore
  const mainCatQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'main-categories'),
      where('storeId', '==', storeId),
      orderBy('order', 'asc')
    );
  }, [db, storeId]);

  const { data: mainCategories, loading } = useCollection(mainCatQuery);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505]">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-24">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex p-3 bg-accent dark:bg-zinc-900 rounded-2xl mb-6 shadow-sm">
            <Sparkles className="h-6 w-6 text-primary dark:text-zinc-100" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-primary dark:text-zinc-100 mb-4 tracking-tight uppercase">مجموعات NOVA</h1>
          <p className="text-primary/60 dark:text-zinc-500 max-w-lg font-medium">اكتشفي الأقسام الرئيسية المصممة لتناسب كل لحظاتكِ</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-accent dark:bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainCategories?.map((m: any) => (
              <Link 
                key={m.id} 
                href={`/shop?main=${m.id}`}
                className="group relative overflow-hidden rounded-[3rem] aspect-[4/5] border border-border/50 dark:border-zinc-800 shadow-premium"
              >
                <Image
                  src={m.image || 'https://picsum.photos/seed/nova/800/1000'}
                  alt={m.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex flex-col justify-end p-10">
                   <div className="flex items-center gap-2 mb-2">
                     <LayoutGrid className="h-4 w-4 text-secondary" />
                     <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">مجموعة فاخرة</span>
                   </div>
                   <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-wider">{m.name}</h3>
                   <div className="flex justify-start">
                      <span className="bg-white text-primary text-xs font-black py-4 px-8 rounded-2xl shadow-xl flex items-center gap-3 active:scale-95 transition-all">
                        استعراض المجموعة
                        <ChevronLeft className="h-4 w-4" />
                      </span>
                   </div>
                </div>
              </Link>
            ))}
            
            {mainCategories?.length === 0 && (
              <div className="col-span-full py-32 text-center bg-accent/30 dark:bg-zinc-900/30 rounded-[4rem] border-2 border-dashed border-primary/10">
                <LayoutGrid className="h-16 w-16 mx-auto mb-6 text-primary opacity-20" />
                <p className="text-primary/40 dark:text-zinc-500 font-black">لم يتم إضافة مجموعات كبرى بعد</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
