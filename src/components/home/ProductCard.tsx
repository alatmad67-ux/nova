
"use client";

import React from 'react';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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
    <Card className="group relative overflow-hidden border-none shadow-sm bg-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 rounded-full bg-white/80 backdrop-blur shadow-sm hover:bg-white text-slate-400 hover:text-red-500"
        >
          <Heart className="h-5 w-5" />
        </Button>
        {product.badge && (
          <Badge className="absolute top-2 left-2 bg-primary text-white border-none px-3" variant="default">
            {product.badge}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground mb-1">{product.category}</p>
        <h4 className="font-semibold text-slate-800 line-clamp-1 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h4>
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">{product.price} د.ع</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{product.originalPrice} د.ع</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full rounded-xl gap-2 h-10 font-medium bg-slate-900 hover:bg-slate-800">
          <ShoppingCart className="h-4 w-4" />
          أضف للسلة
        </Button>
      </CardFooter>
    </Card>
  );
}
