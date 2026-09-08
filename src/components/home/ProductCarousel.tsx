
"use client";

import React from 'react';
import { ProductCard } from './ProductCard';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface ProductCarouselProps {
  title: string;
  products: any[];
  viewAllHref: string;
}

export function ProductCarousel({ title, products, viewAllHref }: ProductCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="container mx-auto px-5 flex items-center justify-between">
        <h2 className="text-lg font-black text-primary dark:text-zinc-100">{title}</h2>
        <Link href={viewAllHref} className="text-[10px] font-bold text-primary/40 dark:text-zinc-500 flex items-center gap-1 hover:text-primary dark:hover:text-zinc-300 transition-colors">
          عرض الكل
          <ChevronLeft className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-4 px-5 pb-6 no-scrollbar snap-x">
        {products.map((product) => (
          <div key={product.id} className="min-w-[155px] md:min-w-[220px] snap-start flex flex-col h-full">
            <ProductCard 
              product={{
                id: product.id,
                name: product.name,
                category: product.categoryName || '',
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images?.[0] || 'https://picsum.photos/seed/placeholder/400/600',
                badge: product.isNew ? 'جديد' : undefined
              }} 
            />
          </div>
        ))}
      </div>
    </section>
  );
}
