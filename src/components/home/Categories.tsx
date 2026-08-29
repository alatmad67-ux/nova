
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';

export function Categories() {
  const db = useFirestore();
  const { storeId } = useStore();

  const catQuery = useMemo(() => {
    // We fetch categories associated with our storeId
    return query(
      collection(db, 'categories'),
      where('storeId', '==', storeId),
      orderBy('order', 'asc')
    );
  }, [db, storeId]);

  const { data: categories, loading } = useCollection(catQuery);

  if (loading) return (
    <div className="flex justify-center gap-8 py-12">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 w-24 rounded-full bg-white/5 animate-pulse" />
      ))}
    </div>
  );

  return (
    <section className="container mx-auto px-4 py-12 overflow-hidden">
      <div className="flex overflow-x-auto pb-8 gap-8 md:gap-16 no-scrollbar snap-x scroll-smooth justify-center md:justify-start">
        {categories && categories.length > 0 ? categories.map((cat: any) => (
          <Link 
            key={cat.id} 
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-5 snap-start min-w-[100px] md:min-w-[140px] group"
          >
            <div className="relative h-20 w-20 md:h-32 md:w-32 rounded-full overflow-hidden bg-white/5 shadow-xl p-1.5 group-hover:scale-110 group-hover:shadow-primary/20 transition-all duration-700 border border-white/10 celestial-glow">
              <div className="relative h-full w-full rounded-full overflow-hidden">
                <Image
                  src={cat.image || 'https://picsum.photos/seed/nova-cat/400/400'}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-125 opacity-70 group-hover:opacity-100"
                  data-ai-hint="fashion category icon"
                />
              </div>
            </div>
            <span className="text-xs md:text-sm font-black text-center text-white/60 tracking-[0.2em] uppercase group-hover:text-primary transition-colors">
              {cat.name}
            </span>
          </Link>
        )) : (
          <div className="w-full text-center py-10 opacity-20 font-bold uppercase tracking-widest">
            لا توجد أقسام مضافة بعد
          </div>
        )}
      </div>
    </section>
  );
}
