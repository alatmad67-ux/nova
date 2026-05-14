"use client";

import React from 'react';
import Image from 'next/image';
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
    <Card className="group relative border-none bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-card-hover flex flex-col h-full shadow-premium">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Actions Overlays */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <button 
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white text-slate-400 hover:text-red-500 transition-all duration-300 scale-90 group-hover:scale-100"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>

        {product.badge && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white border-none px-2 py-0.5 text-[10px] font-bold rounded-md" variant="default">
            {product.badge}
          </Badge>
        )}

        {/* Quick Add Button - Desktop Only */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
          <Button className="w-full bg-slate-900 hover:bg-primary text-white rounded-xl shadow-lg border-none h-10 text-sm font-medium gap-2">
            <ShoppingBag className="h-4 w-4" />
            أضف للسلة
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{product.category}</span>
          <div className="flex items-center gap-0.5 text-yellow-400">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-[10px] font-bold text-slate-500">{product.rating}</span>
          </div>
        </div>

        <h4 className="font-medium text-slate-800 text-sm md:text-base line-clamp-2 mb-3 leading-relaxed min-h-[3rem]">
          {product.name}
        </h4>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">{product.price}</span>
              <span className="text-[10px] font-bold text-slate-900 pt-1">د.ع</span>
            </div>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through decoration-slate-300">
                {product.originalPrice} د.ع
              </span>
            )}
          </div>
          
          {/* Mobile Only Add Button */}
          <Button size="icon" className="md:hidden h-9 w-9 rounded-xl bg-slate-100 hover:bg-primary text-slate-900 hover:text-white transition-colors shadow-none">
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
