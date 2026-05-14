
"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { trendingProductsDiscovery, TrendingProductsDiscoveryOutput } from '@/ai/flows/trending-products-discovery';

export function AITrending() {
  const [data, setData] = useState<TrendingProductsDiscoveryOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrends() {
      try {
        const result = await trendingProductsDiscovery({
          season: "Summer",
          region: "Baghdad",
          currentDate: new Date().toISOString().split('T')[0]
        });
        setData(result);
      } catch (error) {
        console.error("AI flow error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTrends();
  }, []);

  if (loading) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-l from-primary to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <Sparkles className="h-6 w-6 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">تريند العراق</h3>
            <p className="text-blue-100 text-sm opacity-90">مقترحات الذكاء الاصطناعي بناءً على النشاط الأخير في بغداد</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {data?.trendingProducts.slice(0, 3).map((item, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all">
              <div className="flex flex-wrap gap-2 mb-3">
                {item.categories.map((cat, i) => (
                  <Badge key={i} variant="secondary" className="bg-white/20 text-white text-[10px] border-none">
                    {cat}
                  </Badge>
                ))}
              </div>
              <h4 className="font-bold text-lg mb-2">{item.name}</h4>
              <p className="text-sm text-blue-50 opacity-80 line-clamp-2 mb-4 leading-relaxed">
                {item.reasonForTrending}
              </p>
              <button className="flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
                اكتشف الآن
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
