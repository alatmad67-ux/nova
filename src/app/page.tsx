import React from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSlider } from '@/components/home/HeroSlider';
import { Categories } from '@/components/home/Categories';
import { ProductGrid } from '@/components/home/ProductGrid';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { Sparkles, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative bg-background">
      <Header />
      
      <main className="flex-grow">
        <HeroSlider />
        
        {/* Categories Section */}
        <Categories />

        {/* New Arrivals Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-10 border-r-4 border-primary pr-4">
            <div>
              <h2 className="text-3xl font-black text-primary">وصل حديثاً ✨</h2>
              <p className="text-primary/40 text-sm mt-1">أحدث القطع المختارة بعناية</p>
            </div>
            <div className="hidden md:flex gap-2">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <div className="h-2 w-2 bg-primary/20 rounded-full" />
              <div className="h-2 w-2 bg-primary/20 rounded-full" />
            </div>
          </div>
          <ProductGrid />
        </div>
        
        {/* Banner Section - Inspired by Luxury Layout */}
        <section className="container mx-auto px-4 py-20">
          <div className="relative h-[300px] md:h-[450px] w-full rounded-[3rem] overflow-hidden bg-primary group">
            <div className="absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-1000">
              <img 
                src="https://picsum.photos/seed/nova-banner/1200/600" 
                alt="Banner" 
                className="w-full h-full object-cover"
                data-ai-hint="luxury fashion"
              />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
              <Sparkles className="h-10 w-10 text-secondary mb-6" />
              <h3 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-[0.2em]">تألقي بلمسة NOVA</h3>
              <p className="text-white/70 max-w-xl text-lg font-light mb-10">استكشفي تشكيلة فساتين السهرة الجديدة المصممة خصيصاً لتبرز جمالكِ</p>
              <button className="px-12 py-4 bg-white text-primary font-black rounded-2xl hover:scale-105 transition-all shadow-2xl">اكتشفي المجموعة</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}