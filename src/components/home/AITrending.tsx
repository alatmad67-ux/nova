"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowLeft, TrendingUp } from 'lucide-react';
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
    <section className="container mx-auto px-4 py-10">
      <div className="bg-slate-900 rounded-[2rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">الذكاء الاصطناعي</span>
                <Badge variant="outline" className="text-[10px] text-primary-foreground/60 border-primary/30 h-5 px-1.5">LIVE</Badge>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">تريند العراق الآن</h3>
              <p className="text-slate-400 text-sm mt-1">مقترحات ذكية بناءً على سلوك الشراء في بغداد والمنطقة</p>
            </div>
          </div>
          
          <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-white transition-colors group">
            اكتشف كل المقترحات
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {data?.trendingProducts.slice(0, 3).map((item, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap gap-2">
                  {item.categories.slice(0, 1).map((cat, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/20 text-primary text-[10px] border-none font-bold">
                      {cat}
                    </Badge>
                  ))}
                </div>
                <TrendingUp className="h-4 w-4 text-green-400 opacity-60" />
              </div>
              <h4 className="font-bold text-lg mb-2 text-white group-hover:text-primary transition-colors">{item.name}</h4>
              <p className="text-sm text-slate-400 opacity-80 line-clamp-2 mb-6 leading-relaxed">
                {item.reasonForTrending}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-widest cursor-pointer group-hover:gap-3 transition-all">
                تسوق التريند
                <ArrowLeft className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
