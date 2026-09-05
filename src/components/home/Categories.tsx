
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { 
  Zap, 
  Sun, 
  Wind, 
  Sparkles,
  Shirt,
  Gem,
  ShoppingBag
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  'dresses': Shirt,
  'accessories': Gem,
  'bags': ShoppingBag,
  'new': Zap,
  'summer': Sun,
  'winter': Wind,
};

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
    <div className="flex justify-start gap-4 px-5 py-4 overflow-x-auto no-scrollbar">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex flex-col items-center gap-2 min-w-[70px]">
          <div className="h-16 w-16 rounded-full bg-accent animate-pulse" />
          <div className="h-2 w-10 bg-accent animate-pulse rounded" />
        </div>
      ))}
    </div>
  );

  return (
    <section className="container mx-auto">
      <div className="flex overflow-x-auto py-2 px-5 gap-6 no-scrollbar snap-x">
        {sortedCategories.map((cat: any) => {
          const Icon = CATEGORY_ICONS[cat.slug] || Shirt;
          return (
            <Link 
              key={cat.id} 
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 snap-start min-w-[70px] group"
            >
              <div className="h-16 w-16 rounded-2xl bg-white border border-border/50 flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {cat.image ? (
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                  </div>
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>
              <span className="text-[11px] font-bold text-primary/60 group-hover:text-primary transition-colors whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
