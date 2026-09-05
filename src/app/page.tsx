
"use client";

import React, { useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSlider } from '@/components/home/HeroSlider';
import { Categories } from '@/components/home/Categories';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { ProductCard } from '@/components/home/ProductCard';
import { BottomNav } from '@/components/layout/BottomNav';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  Star,
  Loader2,
  X,
  Package
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { intelligentProductSearch } from '@/ai/flows/intelligent-product-search';
import { STORE_ID } from '@/lib/constants';

export default function Home() {
  const { user } = useUser();
  const db = useFirestore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const profileRef = useMemo(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef);

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
      console.error("AI Search Error:", error);
      setAiKeywords(searchTerm.split(' '));
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setAiKeywords([]);
  };

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    if (!searchTerm && aiKeywords.length === 0) return [];

    return allProducts.filter((p: any) => {
      const content = `${p.name} ${p.description} ${p.categoryName} ${p.material || ''}`.toLowerCase();
      if (aiKeywords.length > 0) {
        return aiKeywords.some(kw => content.includes(kw.toLowerCase()));
      }
      return content.includes(searchTerm.toLowerCase());
    });
  }, [allProducts, searchTerm, aiKeywords]);

  const fashionProducts = useMemo(() => 
    allProducts?.filter(p => p.mainCategory === 'fashion').slice(0, 6) || [], 
  [allProducts]);

  const skincareProducts = useMemo(() => 
    allProducts?.filter(p => p.mainCategory === 'skincare').slice(0, 6) || [], 
  [allProducts]);

  const accessoriesProducts = useMemo(() => 
    allProducts?.filter(p => p.mainCategory === 'accessories').slice(0, 6) || [], 
  [allProducts]);

  const isViewSearchResults = searchTerm.length > 0 || aiKeywords.length > 0;

  return (
    <div className="min-h-screen flex flex-col relative bg-background font-arabic pb-32" dir="rtl">
      <Header />
      
      <main className="flex-grow space-y-4 pt-24">
        {/* Top Greeting - Aligned to Right */}
        {!isViewSearchResults && (
          <section className="container mx-auto px-6 flex justify-start">
            <p className="text-primary/40 text-sm font-medium">
              أهلاً، {profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'جميلة نوفا'}
            </p>
          </section>
        )}

        {/* Integrated Sticky Search Bar Section */}
        <section className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl py-4 border-b border-primary/5 transition-all">
          <div className="container mx-auto px-6">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30 group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="عن ماذا تبحثين اليوم؟"
                className="h-14 w-full bg-accent/30 border-none rounded-2xl flex items-center pr-12 pl-12 text-sm text-primary font-bold shadow-sm focus-visible:ring-primary/20"
              />
              {searchTerm && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="absolute left-14 top-1/2 -translate-y-1/2 p-1 text-primary/20 hover:text-primary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button 
                type="submit"
                disabled={isSearching}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </section>

        {isViewSearchResults ? (
          /* Search Results View */
          <section className="container mx-auto px-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-primary">نتائج البحث ({filteredProducts.length})</h3>
               <button onClick={clearSearch} className="text-xs font-black text-secondary underline">عرض المتجر كاملاً</button>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {filteredProducts.map((product: any) => (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      id: product.id,
                      name: product.name,
                      category: product.categoryName || '',
                      price: product.price,
                      originalPrice: product.originalPrice,
                      image: product.images?.[0] || 'https://picsum.photos/seed/placeholder/400/600',
                      rating: 5.0,
                      badge: product.isNew ? 'جديد' : undefined
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-accent/30 rounded-[3rem] border border-dashed border-primary/10">
                <Package className="h-16 w-16 mx-auto mb-6 text-primary opacity-10" />
                <p className="text-primary/40 font-black">لم نجد نتائج مطابقة لبحثكِ، جربي كلمات أخرى</p>
              </div>
            )}
          </section>
        ) : (
          /* Normal Home View */
          <div className="space-y-8">
            <HeroSlider />
            <Categories />

            <section className="container mx-auto px-5 grid grid-cols-4 gap-2">
              {[
                { label: 'منتجات أصلية', icon: ShieldCheck },
                { label: 'شحن آمن', icon: Truck },
                { label: 'عناية فائقة', icon: Star },
                { label: 'دعم مباشر', icon: MessageCircle },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-white border border-primary/5 shadow-sm flex items-center justify-center text-primary/60">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-black text-primary/40 leading-tight">{item.label}</span>
                </div>
              ))}
            </section>

            <div className="space-y-12">
              <ProductCarousel 
                title="الأزياء والملابس" 
                products={fashionProducts} 
                viewAllHref="/category/fashion" 
              />
              
              <ProductCarousel 
                title="العناية بالبشرة" 
                products={skincareProducts} 
                viewAllHref="/category/skincare" 
              />

              <ProductCarousel 
                title="الأكسسوارات" 
                products={accessoriesProducts} 
                viewAllHref="/category/accessories" 
              />
            </div>
          </div>
        )}

        <div className="text-center pt-8 opacity-20 pb-4">
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">بشرتكِ الزجاجية تبدأ من هنا © 2026</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
