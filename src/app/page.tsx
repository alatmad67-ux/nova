
import React from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSlider } from '@/components/home/HeroSlider';
import { Categories } from '@/components/home/Categories';
import { ProductGrid } from '@/components/home/ProductGrid';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { Star, Moon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Celestial Background Elements */}
      <div className="absolute top-40 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Header />
      
      <main className="flex-grow">
        {/* Decorative Celestial Icon */}
        <div className="flex justify-center py-4 text-primary/30">
          <Moon className="h-6 w-6" />
        </div>

        <HeroSlider />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <h2 className="text-2xl font-bold tracking-widest uppercase border-b-2 border-primary/20 pb-2">التصنيفات</h2>
          </div>
          <Categories />
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <h2 className="text-2xl font-bold tracking-widest uppercase border-b-2 border-primary/20 pb-2">أحدث المجموعات</h2>
          </div>
          <ProductGrid />
        </div>
        
        {/* Brand Promise Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { title: "تصاميم حصرية", desc: "ننتقي أجود القطع لتناسب ذوقك الرفيع" },
              { title: "توصيل لكافة العراق", desc: "توصيل سريع وآمن لباب منزلك" },
              { title: "ضمان الجودة", desc: "أقمشة فاخرة وخياطة متقنة" }
            ].map((item, i) => (
              <div key={i} className="p-8 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm group hover:border-primary/30 transition-all">
                <h3 className="text-xl font-bold mb-3 text-primary">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
