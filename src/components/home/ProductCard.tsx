
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, AlertCircle } from 'lucide-react';
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
  }
}

export function ProductCard({ product }: ProductProps) {
  const { toggleFavorite, favorites } = useCart();
  const isFav = favorites.includes(product.id);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : null;

  // منطق التحقق من نفاد المخزون الكلي
  const isOutOfStock = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.every((v: any) => (v.stock || 0) <= 0);
    }
    return (product.stock || 0) <= 0;
  }, [product.stock, product.variants]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] group relative overflow-hidden flex flex-col h-full border border-border/30 dark:border-zinc-800 hover:shadow-lg transition-all duration-500">
      {/* Fixed Aspect Ratio Container for Product Images */}
      <Link 
        href={`/product/${product.id}`} 
        className="block relative aspect-[4/5] w-full overflow-hidden bg-accent/30 dark:bg-zinc-800/50"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={cn(
            "object-contain p-4 transition-transform duration-700 group-hover:scale-110",
            isOutOfStock && "grayscale opacity-60"
          )}
          sizes="(max-width: 768px) 45vw, 20vw"
        />
        
        {/* Floating Actions on Image */}
        <button 
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all z-10",
            isFav ? "bg-primary text-white" : "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-primary dark:text-zinc-100"
          )}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
        >
          <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
        </button>

        {isOutOfStock ? (
          <Badge className="absolute top-3 left-3 bg-zinc-800 text-white border-none px-3 py-1 text-[10px] font-black rounded-lg z-10 shadow-lg flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="h-3 w-3" />
            نفد من المخزون
          </Badge>
        ) : discount ? (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white border-none px-2 py-0.5 text-[10px] font-black rounded-lg z-10 shadow-sm">
            -{discount}%
          </Badge>
        ) : null}
      </Link>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category Badge */}
        <span className="text-[9px] font-black text-primary/30 dark:text-zinc-500 uppercase tracking-widest mb-1">
          {product.category}
        </span>

        {/* Product Name */}
        <h4 className="font-bold text-primary dark:text-zinc-100 text-xs md:text-sm line-clamp-2 h-8 md:h-10 leading-tight mb-3">
          {product.name}
        </h4>
        
        {/* Price and Add Button */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-sm font-black text-primary dark:text-zinc-100">{product.price.toLocaleString()} د.ع</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[9px] text-primary/20 dark:text-zinc-600 line-through font-bold">
                {product.originalPrice.toLocaleString()} د.ع
              </span>
            )}
          </div>
          
          <button 
            disabled={isOutOfStock}
            className={cn(
              "h-9 w-9 rounded-full border border-border/50 dark:border-zinc-700 flex items-center justify-center transition-all shadow-sm active:scale-95",
              isOutOfStock 
                ? "bg-accent/50 text-zinc-300 cursor-not-allowed" 
                : "bg-accent dark:bg-zinc-800 text-primary/60 dark:text-zinc-400 hover:bg-primary hover:text-white dark:hover:bg-primary"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
