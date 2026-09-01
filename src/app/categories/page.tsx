
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { Sparkles, ChevronLeft } from 'lucide-react';

export default function CategoriesPage() {
  const db = useFirestore();
  const { storeId } = useStore();

  const catQuery = useMemo(() => query(
    collection(db, 'categories'),
    where('storeId', '==', storeId)
  ), [db, storeId]);

  const { data: categories, loading } = useCollection(catQuery);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex p-3 bg-accent rounded-2xl mb-6 shadow-sm">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-primary mb-4 tracking-tight">أقسام NOVA</h1>
          <p className="text-primary/60 max-w-lg font-medium">اكتشفي مجموعاتنا الحصرية المصممة لتناسب كل لحظاتكِ</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-accent animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {sortedCategories.map((cat: any) => (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center"
              >
                <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden bg-accent border border-border/50 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2">
                  <Image
                    src={cat.image || 'https://picsum.photos/seed/cat/800/1000'}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    data-ai-hint="fashion category"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                     <span className="bg-white text-primary text-xs font-black py-3 px-8 rounded-2xl shadow-xl flex items-center gap-2">
                       استعراض
                       <ChevronLeft className="h-4 w-4" />
                     </span>
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-black text-primary transition-colors group-hover:text-secondary uppercase tracking-widest text-center">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
