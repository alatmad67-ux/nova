
import React from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSlider } from '@/components/home/HeroSlider';
import { Categories } from '@/components/home/Categories';
import { ProductGrid } from '@/components/home/ProductGrid';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { Sparkles, Moon, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Celestial Background Elements */}
      <div className="absolute top-40 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
      
      <Header />
      
      <main className="flex-grow">
        <HeroSlider />
        
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center gap-4 mb-16">
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4 text-primary animate-pulse" />
              <h2 className="text-2xl md:text-4xl font-black tracking-[0.4em] gold-text uppercase">التصنيفات</h2>
              <Star className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
          <Categories />
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center gap-4 mb-16">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl md:text-4xl font-black tracking-[0.4em] gold-text uppercase">وصل حديثاً</h2>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
          <ProductGrid />
        </div>
        
        {/* Brand Promise Section */}
        <section className="container mx-auto px-4 py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { title: "تصاميم حصرية", desc: "ننتقي أجود القطع العالمية لتناسب ذوقك الرفيع في نوفا", icon: Star },
              { title: "توصيل ملكي", desc: "توصيل سريع وآمن لباب منزلك في كافة أنحاء العراق", icon: Moon },
              { title: "خامات فاخرة", desc: "نضمن لكِ أفضل جودة للأقمشة والخياطة المتقنة", icon: Sparkles }
            ].map((item, i) => (
              <div key={i} className="p-12 nova-card group hover:scale-105 transition-all duration-700 celestial-glow">
                <div className="mb-8 inline-flex p-4 bg-primary/10 rounded-full border border-primary/20">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-black mb-4 gold-text">{item.title}</h3>
                <p className="text-white/40 text-sm font-light leading-relaxed">{item.desc}</p>
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
