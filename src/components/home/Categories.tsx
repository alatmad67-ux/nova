"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from "@/lib/placeholder-images";

const CATEGORIES = [
  { id: 1, name: 'إلكترونيات', icon: 'cat-electronics', hint: 'electronics' },
  { id: 2, name: 'أزياء', icon: 'cat-fashion', hint: 'fashion' },
  { id: 3, name: 'المنزل', icon: 'cat-home', hint: 'home furniture' },
  { id: 4, name: 'جمال', icon: 'cat-electronics', hint: 'beauty cosmetics' },
  { id: 5, name: 'أطفال', icon: 'cat-fashion', hint: 'toys kids' },
  { id: 6, name: 'رياضة', icon: 'cat-electronics', hint: 'sports gear' },
  { id: 7, name: 'سوبر ماركت', icon: 'cat-home', hint: 'grocery' },
];

export function Categories() {
  return (
    <section className="container mx-auto px-4 py-10 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900">تسوق حسب القسم</h3>
        <Link href="/categories" className="text-sm font-semibold text-primary hover:opacity-80 flex items-center gap-1 transition-all">
          مشاهدة الكل
          <span className="text-lg">←</span>
        </Link>
      </div>
      <div className="flex overflow-x-auto pb-4 gap-4 md:gap-8 no-scrollbar snap-x scroll-smooth">
        {CATEGORIES.map((cat) => {
          const img = PlaceHolderImages.find(i => i.id === cat.icon);
          return (
            <Link 
              key={cat.id} 
              href={`/category/${cat.id}`}
              className="flex flex-col items-center gap-4 snap-start min-w-[85px] md:min-w-[110px] group"
            >
              <div className="relative h-16 w-16 md:h-24 md:w-24 rounded-full overflow-hidden bg-white shadow-premium p-1 group-hover:scale-105 group-hover:shadow-card-hover transition-all duration-500 border border-slate-100">
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <Image
                    src={img?.imageUrl || ''}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint={cat.hint}
                  />
                </div>
              </div>
              <span className="text-xs md:text-sm font-bold text-center text-slate-600 whitespace-nowrap group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
