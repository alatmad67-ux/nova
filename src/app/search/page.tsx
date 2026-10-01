
"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProductCard } from '@/components/home/ProductCard';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import { Search as SearchIcon, Sparkles, Loader2, Package, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { intelligentProductSearch } from '@/ai/flows/intelligent-product-search';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const db = useFirestore();
  const { storeId } = useStore();

  const productsQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'products'),
      where('storeId', '==', storeId),
      where('status', '==', 'active')
    );
  }, [db, storeId]);

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

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] font-arabic pb-32">
      <Header />
      
      <main className="flex-grow container mx-auto px-5 pt-28">
        <div className="max-w-xl mx-auto mb-12">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-primary/5 dark:bg-zinc-900 rounded-[2rem] mb-6">
              <Sparkles className="h-8 w-8 text-primary dark:text-zinc-100" />
            </div>
            <h1 className="text-3xl font-black text-primary dark:text-zinc-100 mb-3 tracking-tight">البحث الذكي</h1>
            <p className="text-primary/40 dark:text-zinc-500 font-bold text-xs">سأفهم ذوقكِ حتى بلهجتكِ الخاصة</p>
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <SearchIcon className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 dark:text-zinc-600 group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="عن ماذا تبحثين اليوم؟"
              className="h-16 pr-14 pl-14 bg-white dark:bg-zinc-900 border-none rounded-2xl text-md font-bold shadow-premium dark:shadow-none dark:border dark:border-zinc-800 focus-visible:ring-primary/20"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={clearSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-primary/20 dark:text-zinc-700 hover:text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>
          
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['فستان سهرة', 'بلوزة صوف', 'طقم نسائي'].map(tag => (
              <button 
                key={tag} 
                onClick={() => { setSearchTerm(tag); }}
                className="px-4 py-2 bg-accent/50 dark:bg-zinc-800 rounded-xl text-[10px] font-black text-primary/40 dark:text-zinc-500"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {isSearching || productsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-accent dark:bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-black text-primary/30 dark:text-zinc-600 uppercase tracking-widest mb-6 px-2">نتائج البحث ({filteredProducts.length})</h3>
            <div className="grid grid-cols-2 gap-4">
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
                    badge: product.isNew ? 'جديد' : undefined,
                    stock: product.stock,
                    variants: product.variants,
                    slug: product.slug
                  }} 
                />
              ))}
            </div>
          </div>
        ) : searchTerm && (
          <div className="text-center py-20 bg-accent/30 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-primary/10 dark:border-zinc-800 animate-in zoom-in-95">
            <Package className="h-14 w-14 mx-auto mb-6 text-primary opacity-10 dark:text-zinc-700" />
            <p className="text-primary/40 dark:text-zinc-500 font-black px-10">لم نجد قطعاً تطابق بحثكِ، جربي كلمات أخرى ✨</p>
          </div>
        )}

        <div className="text-center py-10 opacity-20">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] dark:text-zinc-500">NOVA SMART SEARCH — 2026</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
