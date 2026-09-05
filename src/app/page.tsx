
import React from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSlider } from '@/components/home/HeroSlider';
import { Categories } from '@/components/home/Categories';
import { ProductGrid } from '@/components/home/ProductGrid';
import { BottomNav } from '@/components/layout/BottomNav';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative bg-background pb-20 md:pb-0">
      <Header />
      
      <main className="flex-grow">
        <HeroSlider />
        
        {/* Categories Section */}
        <Categories />

        {/* New Arrivals Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-12 border-r-4 border-primary pr-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-secondary" />
                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">NEW IN</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-primary">وصل حديثاً ✨</h2>
            </div>
            <div className="hidden md:flex gap-3">
              <div className="h-2.5 w-12 bg-primary rounded-full" />
              <div className="h-2.5 w-2.5 bg-primary/10 rounded-full" />
              <div className="h-2.5 w-2.5 bg-primary/10 rounded-full" />
            </div>
          </div>
          <ProductGrid />
        </section>
        
        {/* Luxury Banner */}
        <section className="container mx-auto px-4 py-16 mb-20">
          <div className="relative h-[400px] md:h-[550px] w-full rounded-[4rem] overflow-hidden bg-primary group shadow-2xl">
            <div className="absolute inset-0 opacity-40 group-hover:scale-110 transition-transform duration-1000 ease-out">
              <img 
                src="https://picsum.photos/seed/nova-banner/1400/800" 
                alt="Banner" 
                className="w-full h-full object-cover"
                data-ai-hint="luxury fashion"
              />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
              <Sparkles className="h-14 w-14 text-secondary mb-8 animate-pulse" />
              <h3 className="text-4xl md:text-7xl font-black text-white mb-8 uppercase tracking-[0.2em] leading-tight">تألقي بلمسة NOVA</h3>
              <p className="text-white/80 max-w-xl text-lg md:text-xl font-medium mb-12 leading-relaxed">استكشفي تشكيلة فساتين السهرة الجديدة المصممة خصيصاً لتبرز جمالكِ الاستثنائي</p>
              <button className="px-16 py-5 bg-white text-primary font-black rounded-3xl hover:bg-secondary hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95">اكتشفي المجموعة الآن</button>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-primary/50 to-transparent" />
          </div>
        </section>
      </main>

      {/* Removed General Footer to keep it clean for mobile shoppers */}
      <BottomNav />
    </div>
  );
}
