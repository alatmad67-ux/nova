
"use client";

import React, { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProductCard } from '@/components/home/ProductCard';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { useCart } from '@/providers/cart-provider';
import { Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function WishlistPage() {
  const { favorites } = useCart();
  const db = useFirestore();
  const { storeId } = useStore();

  const productsQuery = useMemo(() => query(
    collection(db, 'products'),
    where('storeId', '==', storeId),
    where('status', '==', 'active')
  ), [db, storeId]);

  const { data: allProducts, loading } = useCollection(productsQuery);

  const favoriteProducts = useMemo(() => {
    if (!allProducts || favorites.length === 0) return [];
    return allProducts.filter((p: any) => favorites.includes(p.id));
  }, [allProducts, favorites]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex p-3 bg-accent rounded-2xl mb-6">
            <Heart className="h-6 w-6 text-primary fill-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-primary mb-4">المفضلة</h1>
          <p className="text-primary/60 font-medium">القطع التي وقعتِ في حبها، بانتظار أن تكون لكِ</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] rounded-[2rem] bg-accent animate-pulse" />
            ))}
          </div>
        ) : favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {favoriteProducts.map((product: any) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  name: product.name,
                  category: product.categoryName || '',
                  price: product.price,
                  originalPrice: product.originalPrice,
                  image: product.images?.[0] || 'https://picsum.photos/seed/placeholder/400/600',
                  rating: 5.0
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-20 px-8 bg-accent rounded-[3rem] border border-border/50">
            <Sparkles className="h-16 w-16 mx-auto mb-6 text-primary opacity-20" />
            <h3 className="text-2xl font-black text-primary mb-4">قائمتكِ فارغة</h3>
            <p className="text-primary/40 mb-10 font-medium leading-relaxed">لم تقومي بإضافة أي قطع للمفضلة بعد، ابدأي باكتشاف أحدث مجموعاتنا</p>
            <Button asChild className="w-full h-16 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all">
              <Link href="/shop">
                <ShoppingBag className="ml-2 h-5 w-5" />
                ابدأ التسوق
              </Link>
            </Button>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
