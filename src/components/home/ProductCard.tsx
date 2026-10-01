"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus, Star } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useCart } from '@/providers/cart-provider';
import { cn } from "@/lib/utils";

interface ProductProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
    image: string;
    badge?: string;
    stock?: number;
    variants?: any[];
    slug?: string;
  }
}

export function ProductCard({ product }: ProductProps) {
  const { toggleFavorite, favorites } = useCart();
  const isFav = favorites.includes(product.id);

  const isOutOfStock = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.every((v: any) => (v.stock || 0) <= 0);
    }
    return (product.stock || 0) <= 0;
  }, [product.stock, product.variants]);

  const productPath = `/product/${product.slug || product.id}`;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-500 group relative border border-transparent dark:border-zinc-800">
      {/* Wishlist Button */}
      <button 
        className={cn(
          "absolute top-6 left-6 z-20 h-9 w-9 rounded-full flex items-center justify-center transition-all",
          isFav ? "text-red-500" : "text-primary/10 dark:text-zinc-700 hover:text-primary dark:hover:text-zinc-400"
        )}
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(product.id);
        }}
      >
        <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
      </button>

      {/* Product Image */}
      <Link href={productPath} className="block relative aspect-[4/5] w-full mb-4 overflow-hidden rounded-3xl bg-[#FAF8F5] dark:bg-zinc-800">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={cn(
            "object-contain p-2 transition-transform duration-700 group-hover:scale-110",
            isOutOfStock && "grayscale opacity-50"
          )}
          sizes="(max-width: 768px) 45vw, 20vw"
        />
      </Link>

      {/* Info Area */}
      <div className="flex flex-col flex-grow text-right">
        <h4 className="font-black text-primary dark:text-zinc-100 text-sm line-clamp-1 mb-0.5">
          {product.name}
        </h4>
        <span className="text-[10px] font-bold text-primary/30 dark:text-zinc-500 uppercase tracking-widest mb-3">
          {product.category}
        </span>
        
        {/* Fake Rating */}
        <div className="flex items-center gap-1 mb-4 justify-start dir-ltr">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-2.5 w-2.5 fill-secondary text-secondary" />)}
          </div>
          <span className="text-[8px] font-black text-primary/20 dark:text-zinc-700">(126)</span>
        </div>

        {/* Price & Add */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-[9px] font-bold text-primary/30 dark:text-zinc-600 uppercase">د.ع</span>
            <span className="text-md font-black text-primary dark:text-zinc-100">{product.price.toLocaleString()}</span>
          </div>
          
          <button 
            disabled={isOutOfStock}
            className={cn(
              "h-9 w-9 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90",
              isOutOfStock 
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed" 
                : "bg-secondary text-white shadow-secondary/20"
            )}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
