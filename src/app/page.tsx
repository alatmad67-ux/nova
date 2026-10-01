
"use client";

import React, { useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSlider } from '@/components/home/HeroSlider';
import { Categories } from '@/components/home/Categories';
import { ProductCard } from '@/components/home/ProductCard';
import { BottomNav } from '@/components/layout/BottomNav';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { 
  Search, 
  SlidersHorizontal,
  ChevronLeft,
  Loader2,
  Package,
  Sparkles
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { intelligentProductSearch } from '@/ai/flows/intelligent-product-search';
import { STORE_ID } from '@/lib/constants';
import Link from 'next/link';

export default function Home() {
  const { user } = useUser();
  const db = useFirestore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('storeId', '==', STORE_ID),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
  }, [db]);
  const { data: allProducts, loading: productsLoading } = useCollection(productsQuery);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const result = await intelligentProductSearch({ query: searchTerm });
      setAiKeywords(result.keywords);
    } catch (error) {
      setAiKeywords(searchTerm.split(' '));
    } finally {
      setIsSearching(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    if (!searchTerm && aiKeywords.length === 0) return allProducts;

    return allProducts.filter((p: any) => {
      const content = `${p.name} ${p.description} ${p.categoryName}`.toLowerCase();
      if (aiKeywords.length > 0) return aiKeywords.some(kw => content.includes(kw.toLowerCase()));
      return content.includes(searchTerm.toLowerCase());
    });
  }, [allProducts, searchTerm, aiKeywords]);

  const displayProducts = searchTerm || aiKeywords.length > 0 ? filteredProducts : allProducts?.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32" dir="rtl">
      <Header />
      
      <main className="flex-grow space-y-4">
        {/* Hero Slider */}
        <HeroSlider />

        {/* Search Bar - Integrated in Flow */}
        <section className="container mx-auto px-6 py-2">
          <div className="flex gap-4">
            <form onSubmit={handleSearch} className="relative flex-1 group">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحثي عن منتجاتكِ المفضلة..."
                className="h-16 w-full bg-white border-none rounded-full flex items-center pr-14 pl-14 text-sm text-primary font-bold shadow-sm focus-visible:ring-primary/10"
              />
            </form>
            <button className="h-16 w-16 bg-white rounded-[2rem] flex items-center justify-center text-primary shadow-sm active:scale-95 transition-all">
              <SlidersHorizontal className="h-6 w-6" />
            </button>
          </div>
        </section>

        {/* Categories Section */}
        <Categories />

        {/* Best Sellers Header */}
        <section className="container mx-auto px-6 pt-4 flex items-center justify-between">
          <h3 className="text-xl font-black text-primary tracking-tight">الأكثر مبيعاً</h3>
          <Link href="/shop" className="text-xs font-black text-primary/40 flex items-center gap-1 hover:text-primary transition-colors">
            عرض الكل <ChevronLeft className="h-4 w-4 rotate-180" />
          </Link>
        </section>

        {/* Product Grid */}
        <section className="container mx-auto px-6 py-4">
          {productsLoading || isSearching ? (
            <div className="grid grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/6] rounded-[2.5rem] bg-white animate-pulse" />)}
            </div>
          ) : displayProducts && displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {displayProducts.map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    id: product.id,
                    name: product.name,
                    category: product.categoryName || 'جمال',
                    price: product.price,
                    image: product.images?.[0] || 'https://picsum.photos/seed/placeholder/400/600',
                    stock: product.stock,
                    variants: product.variants,
                    slug: product.slug
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm">
              <Package className="h-16 w-16 mx-auto mb-4 text-primary/10" />
              <p className="font-black text-primary/40">لا توجد قطع حالياً</p>
            </div>
          )}
        </section>

        {/* Special Offer Banner */}
        <section className="container mx-auto px-6 py-4">
          <div className="bg-[#fdf2f2] rounded-[3rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/40 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 space-y-4">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">عرض خاص</span>
              <h3 className="text-3xl font-black text-primary max-w-[200px]">خصومات تصل إلى 30%</h3>
              <p className="text-[11px] text-primary/40 font-bold max-w-[200px]">على أفضل أساسيات الجمال المختارة</p>
              <button className="flex items-center gap-3 bg-secondary text-white px-6 py-3 rounded-2xl text-[11px] font-black shadow-lg shadow-secondary/20">
                احصلي عليه الآن <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            {/* Visual elements */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 h-24 w-24 bg-white rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white">
               <span className="text-2xl font-black text-red-500">30%</span>
               <span className="text-[8px] font-black text-primary/20 uppercase leading-none">OFF</span>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
