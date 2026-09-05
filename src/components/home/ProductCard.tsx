
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
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-accent/30 m-1.5 rounded-[1.6rem]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 45vw, 20vw"
        />
        
        <button 
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-all z-10",
            isFav ? "bg-primary text-white" : "bg-white/80 backdrop-blur-sm text-primary"
          )}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
        >
          <Heart className={cn("h-3.5 w-3.5", isFav && "fill-current")} />
        </button>

        {discount && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white border-none px-1.5 py-0.5 text-[8px] font-black rounded-lg z-10">
            -{discount}%
          </Badge>
        )}
      </Link>

      <div className="px-3 pb-3 flex flex-col flex-grow">
        <h4 className="font-bold text-primary text-[11px] md:text-xs line-clamp-1 mb-1">
          {product.name}
        </h4>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs font-black text-primary">{product.price.toLocaleString()} د.ع</span>
            {product.originalPrice && (
              <span className="text-[8px] text-primary/30 line-through">
                {product.originalPrice.toLocaleString()} د.ع
              </span>
            )}
          </div>
          <button className="h-7 w-7 rounded-full bg-accent border border-border/50 flex items-center justify-center text-primary/60 hover:bg-primary hover:text-white transition-all">
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
