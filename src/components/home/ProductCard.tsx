
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
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
  }
}

export function ProductCard({ product }: ProductProps) {
  const { toggleFavorite, favorites } = useCart();
  const isFav = favorites.includes(product.id);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : null;

  return (
    <div className="bg-white rounded-[2rem] group relative overflow-hidden flex flex-col h-full border border-border/30 hover:shadow-lg transition-all duration-500">
      {/* Fixed Aspect Ratio Container for Product Images - Unified across store */}
      <Link 
        href={`/product/${product.id}`} 
        className="block relative aspect-[4/5] w-full overflow-hidden bg-accent/30"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 45vw, 20vw"
        />
        
        {/* Floating Actions on Image */}
        <button 
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all z-10",
            isFav ? "bg-primary text-white" : "bg-white/80 backdrop-blur-sm text-primary"
          )}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
        >
          <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
        </button>

        {discount && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white border-none px-2 py-0.5 text-[10px] font-black rounded-lg z-10 shadow-sm">
            -{discount}%
          </Badge>
        )}
      </Link>

      {/* Content Area with Fixed Heights for Alignment */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category Badge - Small & Subtle */}
        <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest mb-1">
          {product.category}
        </span>

        {/* Product Name - Fixed height for 2 lines ensures prices align horizontally */}
        <h4 className="font-bold text-primary text-xs md:text-sm line-clamp-2 h-8 md:h-10 leading-tight mb-3">
          {product.name}
        </h4>
        
        {/* Price and Add Button - Pushed to bottom of card */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-sm font-black text-primary">{product.price.toLocaleString()} د.ع</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[9px] text-primary/20 line-through font-bold">
                {product.originalPrice.toLocaleString()} د.ع
              </span>
            )}
          </div>
          
          <button className="h-9 w-9 rounded-full bg-accent border border-border/50 flex items-center justify-center text-primary/60 hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95">
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
