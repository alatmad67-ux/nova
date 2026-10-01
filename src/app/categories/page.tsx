
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { Header } from '@/components/layout/Header';
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
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] font-arabic pb-32">
      <Header />
      
      <main className="flex-grow container mx-auto px-6 pt-28">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-secondary" />
            <span className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">تصفحي المجموعات</span>
          </div>
          <h1 className="text-4xl font-black text-primary dark:text-zinc-100 tracking-tight">عالم NOVA</h1>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[3rem] bg-accent dark:bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {mainCategories?.map((m: any) => (
              <Link 
                key={m.id} 
                href={`/shop?main=${m.id}`}
                className="group relative overflow-hidden rounded-[3rem] h-72 border border-border/50 dark:border-zinc-800 shadow-premium"
              >
                <Image
                  src={m.image || 'https://picsum.photos/seed/nova/800/1000'}
                  alt={m.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex flex-col justify-end p-10">
                   <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-wider">{m.name}</h3>
                   <div className="flex justify-start">
                      <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black py-3 px-6 rounded-2xl shadow-xl flex items-center gap-3 active:scale-95 transition-all border border-white/20">
                        استعراض المجموعة
                        <ChevronLeft className="h-4 w-4" />
                      </span>
                   </div>
                </div>
              </Link>
            ))}
            
            {mainCategories?.length === 0 && (
              <div className="py-32 text-center bg-accent/30 dark:bg-zinc-900/30 rounded-[4rem] border-2 border-dashed border-primary/10 dark:border-zinc-800">
                <LayoutGrid className="h-16 w-16 mx-auto mb-6 text-primary opacity-20 dark:text-zinc-700" />
                <p className="text-primary/40 dark:text-zinc-500 font-black">لم يتم إضافة مجموعات كبرى بعد</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center py-10 opacity-20">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] dark:text-zinc-500">NOVA FASHION HOUSE — 2026</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
