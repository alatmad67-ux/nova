
"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useStore } from '@/providers/store-provider';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft } from 'lucide-react';

export function HeroSlider() {
  const db = useFirestore();
  const { storeId } = useStore();

  const sliderQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'sliders'), 
      where('storeId', '==', storeId), 
      where('isActive', '==', true)
    );
  }, [db, storeId]);
  
  const { data: slides, loading } = useCollection(sliderQuery);

  const sortedSlides = useMemo(() => {
    if (loading) return [];
    if (!slides || slides.length === 0) return [
      { 
        title: "تألقي بجمال طبيعي وكوني مميزة", 
        subtitle: "استكشفي مجموعتنا الفاخرة المنسقة خصيصاً لكِ", 
        image: "https://picsum.photos/seed/nova-h1/1200/800",
        link: "/shop"
      }
    ];
    return [...slides].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [slides, loading]);

  if (loading) return (
    <section className="container mx-auto px-6 py-2">
      <div className="w-full h-[220px] rounded-[3rem] bg-accent/20 animate-pulse" />
    </section>
  );

  return (
    <section className="container mx-auto px-6 py-4">
      <Carousel 
        opts={{ loop: true, direction: 'rtl' }}
        plugins={[Autoplay({ delay: 5000 })]}
        className="w-full overflow-hidden rounded-[3rem] shadow-premium"
      >
        <CarouselContent>
          {sortedSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[240px] md:h-[450px] w-full bg-[#fdf5f0]">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover opacity-80"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-[#fdf5f0] via-[#fdf5f0]/40 to-transparent flex flex-col justify-center p-10 max-w-[70%]">
                  <span className="text-[10px] font-black text-secondary bg-white w-fit px-3 py-1 rounded-full mb-4 shadow-sm uppercase tracking-widest">جديدنا الآن</span>
                  <h2 className="text-2xl md:text-5xl font-black text-primary mb-3 leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-[11px] md:text-xl text-primary/60 font-bold mb-6 line-clamp-2 leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <Link 
                    href={slide.link || "/shop"} 
                    className="flex items-center gap-3 bg-secondary text-white w-fit px-6 py-3 rounded-2xl text-[11px] font-black shadow-lg shadow-secondary/20 hover:scale-105 transition-all"
                  >
                    تسوقي الآن
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {sortedSlides.map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary/20" />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
