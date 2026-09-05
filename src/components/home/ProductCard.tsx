
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
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
    <div className="bg-white rounded-[2.5rem] group relative overflow-hidden flex flex-col h-full border border-border/30 hover:shadow-xl transition-all duration-500">
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-accent/30 m-2 rounded-[2rem]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        
        {/* Heart Icon Top Right */}
        <button 
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full shadow-md transition-all z-10",
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
          <Badge className="absolute top-3 left-3 bg-red-500 text-white border-none px-2 py-0.5 text-[9px] font-black rounded-lg z-10">
            -{discount}%
          </Badge>
        )}
      </Link>

      <div className="px-4 pb-4 flex flex-col flex-grow">
        <h4 className="font-bold text-primary text-xs md:text-sm line-clamp-1 mb-1">
          {product.name}
        </h4>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-sm font-black text-primary">{product.price.toLocaleString()} د.ع</span>
            {product.originalPrice && (
              <span className="text-[10px] text-primary/30 line-through">
                {product.originalPrice.toLocaleString()} د.ع
              </span>
            )}
          </div>
          <button className="h-8 w-8 rounded-full bg-accent border border-border/50 flex items-center justify-center text-primary/60 hover:bg-primary hover:text-white transition-all">
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
