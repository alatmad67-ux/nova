
"use client";

import React from 'react';
import { ProductCard } from './ProductCard';
import { PlaceHolderImages } from "@/lib/placeholder-images";

const PRODUCTS = [
  {
    id: '1',
    name: 'سماعات الرأس اللاسلكية برو',
    category: 'إلكترونيات',
    price: '125,000',
    originalPrice: '150,000',
    rating: 4.8,
    reviews: 124,
    image: PlaceHolderImages.find(p => p.id === 'prod-1')?.imageUrl || '',
    badge: 'خصم 20%'
  },
  {
    id: '2',
    name: 'ساعة ذكية الإصدار السابع',
    category: 'إلكترونيات',
    price: '85,000',
    rating: 4.5,
    reviews: 89,
    image: PlaceHolderImages.find(p => p.id === 'prod-2')?.imageUrl || '',
    badge: 'جديد'
  },
  {
    id: '3',
    name: 'نظارات شمسية كلاسيكية',
    category: 'أزياء',
    price: '45,000',
    rating: 4.2,
    reviews: 45,
    image: PlaceHolderImages.find(p => p.id === 'prod-3')?.imageUrl || '',
  },
  {
    id: '4',
    name: 'كمبيوتر محمول للألعاب',
    category: 'كمبيوتر',
    price: '1,450,000',
    originalPrice: '1,600,000',
    rating: 4.9,
    reviews: 56,
    image: PlaceHolderImages.find(p => p.id === 'prod-4')?.imageUrl || '',
    badge: 'الأكثر مبيعاً'
  }
];

export function ProductGrid() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">أحدث المنتجات</h3>
          <p className="text-muted-foreground text-sm mt-1">اكتشف أحدث العروض الحصرية لهذا الأسبوع</p>
        </div>
        <button className="px-4 py-2 border rounded-full text-sm font-medium hover:bg-secondary transition-colors">
          تصفية النتائج
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
