"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { ArrowLeft } from 'lucide-react';

export function Categories() {
  const db = useFirestore();
  const { storeId } = useStore();

  const catQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'categories'),
      where('storeId', '==', storeId)
    );
  }, [db, storeId]);

  const { data: categories, loading } = useCollection(catQuery);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  if (loading) return (
    <div className="flex justify-center gap-6 py-12">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="h-24 w-24 rounded-2xl bg-muted/50 animate-pulse" />
      ))}
    </div>
  );

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-primary">تسوقي حسب الفئة</h3>
        <Link href="/shop" className="text-xs font-bold text-secondary hover:text-primary flex items-center gap-1 transition-colors">
          عرض الكل
          <ArrowLeft className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex overflow-x-auto pb-6 gap-6 md:gap-8 no-scrollbar snap-x scroll-smooth">
        {sortedCategories.map((cat: any) => (
          <Link 
            key={cat.id} 
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-4 snap-start min-w-[100px] md:min-w-[150px] group"
          >
            <div className="relative h-24 w-24 md:h-36 md:w-36 rounded-2xl overflow-hidden bg-accent p-1 border border-border/50 group-hover:scale-105 transition-all duration-500 shadow-sm group-hover:shadow-md">
              <div className="relative h-full w-full rounded-xl overflow-hidden">
                <Image
                  src={cat.image || 'https://picsum.photos/seed/nova-cat/400/400'}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint="category fashion"
                />
              </div>
            </div>
            <span className="text-xs md:text-sm font-bold text-primary group-hover:text-secondary transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}