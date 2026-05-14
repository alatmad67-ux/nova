
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductProps {
  product: {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    category: string;
    rating: number;
    reviews: number;
    image: string;
    badge?: string;
  }
}

export function ProductCard({ product }: ProductProps) {
  return (
    <Card className="group relative border-none bg-white rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:shadow-card-hover flex flex-col h-full shadow-premium">
      {/* Image Container */}
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-slate-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Actions Overlays */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <button 
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white text-slate-400 hover:text-red-500 transition-all duration-300 scale-90 group-hover:scale-100 z-10"
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart className="h-4 w-4" />
        </button>

        {product.badge && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white border-none px-2.5 py-0.5 text-[10px] font-bold rounded-lg shadow-lg z-10" variant="default">
            {product.badge}
          </Badge>
        )}

        {/* Quick View Hint - Desktop Only */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full font-bold text-xs text-slate-900 shadow-xl border border-white/50">
            مشاهدة التفاصيل
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">{product.category}</span>
          <div className="flex items-center gap-0.5 text-yellow-400">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-[10px] font-bold text-slate-500">{product.rating}</span>
          </div>
        </div>

        <Link href={`/product/${product.id}`} className="block">
          <h4 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 mb-4 leading-relaxed hover:text-primary transition-colors min-h-[3rem]">
            {product.name}
          </h4>
        </Link>

        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg md:text-xl font-black text-slate-900">{product.price}</span>
              <span className="text-[10px] font-bold text-slate-500">د.ع</span>
            </div>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through decoration-slate-300/60">
                {product.originalPrice} د.ع
              </span>
            )}
          </div>
          
          <Button size="icon" className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-primary text-white transition-all shadow-lg shadow-slate-900/10 hover:shadow-primary/20 active:scale-95">
            <ShoppingBag className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
