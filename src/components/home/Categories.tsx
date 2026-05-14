
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
    <section className="container mx-auto px-4 py-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">تسوق حسب القسم</h3>
        <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
          عرض الكل
        </Link>
      </div>
      <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar snap-x">
        {CATEGORIES.map((cat) => {
          const img = PlaceHolderImages.find(i => i.id === cat.icon);
          return (
            <Link 
              key={cat.id} 
              href={`/category/${cat.id}`}
              className="flex flex-col items-center gap-3 snap-start min-w-[90px] group"
            >
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-secondary transition-transform group-hover:scale-105 duration-300">
                <Image
                  src={img?.imageUrl || ''}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  data-ai-hint={cat.hint}
                />
              </div>
              <span className="text-sm font-medium text-center text-slate-700 whitespace-nowrap group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
