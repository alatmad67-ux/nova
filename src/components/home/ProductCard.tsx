"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Plus } from 'lucide-react';
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
    <div className="bg-white rounded-[2rem] group relative overflow-hidden flex flex-col h-full border border-border/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
      <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-muted/30">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
          data-ai-hint="fashion clothes"
        />
        
        {/* Actions Overlay */}
        <button 
          className={cn(
            "absolute top-4 right-4 p-2.5 rounded-full shadow-lg transition-all duration-300 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 z-10",
            isFav ? "bg-primary text-white" : "bg-white text-primary hover:bg-primary hover:text-white"
          )}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
        >
          <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
        </button>

        {product.badge && (
          <Badge className="absolute top-4 left-4 bg-secondary text-white border-none px-3 py-1 text-[9px] font-bold rounded-lg shadow-sm z-10">
            {product.badge}
          </Badge>
        )}

        {discount && (
          <Badge className="absolute bottom-4 left-4 bg-primary text-white border-none px-2 py-0.5 text-[9px] font-bold rounded-lg z-10">
            -{discount}%
          </Badge>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-grow text-center">
        <h4 className="font-bold text-primary text-sm md:text-base line-clamp-1 mb-2">
          {product.name}
        </h4>

        <div className="flex flex-col items-center gap-1 mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-primary">{product.price.toLocaleString()}</span>
            <span className="text-[9px] font-bold text-primary/40">د.ع</span>
          </div>
          {product.originalPrice && (
            <span className="text-xs text-primary/30 line-through">
              {product.originalPrice.toLocaleString()} د.ع
            </span>
          )}
        </div>
        
        <div className="mt-auto">
          <Button asChild className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]">
            <Link href={`/product/${product.id}`} className="flex items-center justify-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-xs font-bold">تسوقي الآن</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}