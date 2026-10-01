"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { Shirt, Sparkles } from 'lucide-react';

export function Categories() {
  const db = useFirestore();
  const { storeId } = useStore();

  const catQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(collection(db, 'categories'), where('storeId', '==', storeId));
  }, [db, storeId]);

  const { data: categories, loading } = useCollection(catQuery);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  if (loading) return (
    <div className="flex justify-start gap-6 px-6 py-4 overflow-x-auto no-scrollbar">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex flex-col items-center gap-3 min-w-[80px]">
          <div className="h-16 w-16 rounded-full bg-white dark:bg-zinc-900 animate-pulse shadow-sm" />
          <div className="h-2 w-12 bg-accent dark:bg-zinc-800 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <section className="container mx-auto">
      <div className="flex overflow-x-auto py-6 px-6 gap-6 no-scrollbar snap-x">
        {/* Offers Card First */}
        <Link href="/shop?offers=true" className="flex flex-col items-center gap-3 snap-start min-w-[70px] group">
          <div className="h-16 w-16 rounded-[1.5rem] bg-[#fdf2f2] dark:bg-red-950/20 flex items-center justify-center shadow-sm border border-red-50 dark:border-red-900/10 group-hover:scale-110 transition-all">
            <Sparkles className="h-6 w-6 text-red-400" />
          </div>
          <span className="text-[11px] font-black text-primary/40 dark:text-zinc-500 group-hover:text-primary dark:group-hover:text-zinc-300 transition-colors">عروض</span>
        </Link>

        {sortedCategories.map((cat: any) => (
          <Link 
            key={cat.id} 
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-3 snap-start min-w-[70px] group"
          >
            <div className="h-16 w-16 rounded-[1.5rem] bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center overflow-hidden border border-transparent group-hover:border-secondary dark:group-hover:border-secondary/50 transition-all relative">
              {cat.image ? (
                <Image src={cat.image} alt={cat.name} fill className="object-cover p-2" />
              ) : (
                <Shirt className="h-6 w-6 text-primary/40 dark:text-zinc-600" />
              )}
            </div>
            <span className="text-[11px] font-black text-primary/40 dark:text-zinc-500 group-hover:text-primary dark:group-hover:text-zinc-300 transition-colors whitespace-nowrap">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
