
"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProductCard } from '@/components/home/ProductCard';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { Search as SearchIcon, Sparkles, Loader2, Package } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { intelligentProductSearch } from '@/ai/flows/intelligent-product-search';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const db = useFirestore();
  const { storeId } = useStore();

  const productsQuery = useMemo(() => query(
    collection(db, 'products'),
    where('storeId', '==', storeId),
    where('status', '==', 'active')
  ), [db, storeId]);

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
      // Fallback to manual keywords
      setAiKeywords(searchTerm.split(' '));
    } finally {
      setIsSearching(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    if (!searchTerm && aiKeywords.length === 0) return [];

    return allProducts.filter((p: any) => {
      const content = `${p.name} ${p.description} ${p.categoryName} ${p.material || ''}`.toLowerCase();
      
      // If AI keyword exists, use them for more intelligent matching
      if (aiKeywords.length > 0) {
        return aiKeywords.some(kw => content.includes(kw.toLowerCase()));
      }
      
      // Fallback to basic search
      return content.includes(searchTerm.toLowerCase());
    });
  }, [allProducts, searchTerm, aiKeywords]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex p-3 bg-accent rounded-2xl mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-primary mb-4">البحث الذكي</h1>
            <p className="text-primary/60 font-medium text-sm">ابحثي بلهجتكِ، وسأفهم ذوقكِ (مثلاً: أريد فساتين سهرة فخمة)</p>
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <SearchIcon className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/30 group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="عن ماذا تبحثين اليوم؟"
              className="h-16 md:h-20 pr-16 pl-6 bg-white border-2 border-border/50 rounded-[2rem] text-lg font-bold shadow-sm focus:border-primary/50 transition-all outline-none"
            />
            <Button 
              type="submit" 
              disabled={isSearching}
              className="absolute left-3 top-3 bottom-3 rounded-[1.5rem] bg-primary text-white font-black px-8 hover:scale-105 transition-all"
            >
              {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : 'بحث'}
            </Button>
          </form>
        </div>

        {isSearching || productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] rounded-[2rem] bg-accent animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-8 border-r-4 border-secondary pr-4">
              <h3 className="text-xl font-black text-primary">نتائج البحث ({filteredProducts.length})</h3>
            </div>
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
          </div>
        ) : searchTerm && (
          <div className="text-center py-20 bg-accent rounded-[3rem]">
            <Package className="h-16 w-16 mx-auto mb-6 text-primary opacity-20" />
            <p className="text-primary/60 font-bold">لم نجد نتائج تطابق بحثكِ، جربي كلمات أخرى</p>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
