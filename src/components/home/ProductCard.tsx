
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
    rating: number;
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
    <div className="nova-card group relative overflow-hidden flex flex-col h-full celestial-glow">
      <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-white/5">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <button 
          className={cn(
            "absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 scale-90 group-hover:scale-100 z-10",
            isFav ? "bg-primary text-black" : "bg-black/40 text-white hover:text-primary"
          )}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
        >
          <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
        </button>

        {product.badge && (
          <Badge className="absolute top-4 left-4 bg-primary text-black border-none px-3 py-1 text-[10px] font-black rounded-lg shadow-lg z-10">
            {product.badge}
          </Badge>
        )}

        {discount && (
          <Badge className="absolute bottom-4 right-4 bg-red-500 text-white border-none px-2 py-0.5 text-[10px] font-black rounded-md z-10">
            -{discount}%
          </Badge>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{product.category}</span>
          <div className="flex items-center gap-1 text-primary">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-[10px] font-black">{product.rating.toFixed(1)}</span>
          </div>
        </div>

        <Link href={`/product/${product.id}`} className="block group/title">
          <h4 className="font-bold text-white/90 text-sm md:text-base line-clamp-2 mb-4 leading-relaxed group-hover/title:text-primary transition-colors min-h-[3rem]">
            {product.name}
          </h4>
        </Link>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg md:text-xl font-black gold-text">{product.price.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase">د.ع</span>
            </div>
            {product.originalPrice && (
              <span className="text-xs text-white/30 line-through">
                {product.originalPrice.toLocaleString()} د.ع
              </span>
            )}
          </div>
          
          <Button asChild size="icon" className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/80 text-black shadow-lg shadow-primary/10">
            <Link href={`/product/${product.id}`}>
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
