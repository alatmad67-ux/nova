
import React from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSlider } from '@/components/home/HeroSlider';
import { Categories } from '@/components/home/Categories';
import { ProductGrid } from '@/components/home/ProductGrid';
import { AITrending } from '@/components/home/AITrending';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <HeroSlider />
        <Categories />
        <AITrending />
        <ProductGrid />
        
        {/* Additional Marketing Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-secondary p-8 rounded-3xl flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">ضمان حقيقي 100%</h3>
              <p className="text-muted-foreground mb-6">نحن نضمن جودة جميع المنتجات المعروضة في متجرنا مع إمكانية الإرجاع خلال 14 يوماً.</p>
              <button className="w-fit font-bold text-primary hover:underline">اعرف المزيد</button>
            </div>
            <div className="bg-primary/5 p-8 rounded-3xl flex flex-col justify-center border border-primary/10">
              <h3 className="text-2xl font-bold mb-4">توصيل سريع لكل المحافظات</h3>
              <p className="text-muted-foreground mb-6">خدمة التوصيل السريع تصلك أينما كنت في العراق خلال 24-48 ساعة عمل.</p>
              <button className="w-fit font-bold text-primary hover:underline">مناطق التغطية</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
