
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
      <div className="w-full h-[180px] rounded-[2.5rem] bg-accent/20 animate-pulse" />
    </section>
  );

  return (
    <section className="container mx-auto px-6 py-2">
      <Carousel 
        opts={{ loop: true, direction: 'rtl' }}
        plugins={[Autoplay({ delay: 5000 })]}
        className="w-full overflow-hidden rounded-[2.5rem] shadow-premium"
      >
        <CarouselContent>
          {sortedSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[190px] md:h-[350px] w-full bg-[#fdf5f0] dark:bg-zinc-900">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover opacity-90 dark:opacity-60"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-[#fdf5f0] dark:from-black/80 via-[#fdf5f0]/30 dark:via-black/20 to-transparent flex flex-col justify-center p-8 max-w-[75%]">
                  <span className="text-[9px] font-black text-secondary bg-white dark:bg-zinc-800 w-fit px-2.5 py-1 rounded-full mb-3 shadow-sm uppercase tracking-widest">جديدنا الآن</span>
                  <h2 className="text-xl md:text-4xl font-black text-primary dark:text-zinc-100 mb-2 leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-[10px] md:text-lg text-primary/60 dark:text-zinc-400 font-bold mb-4 line-clamp-1 leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <Link 
                    href={slide.link || "/shop"} 
                    className="flex items-center gap-2 bg-secondary text-white w-fit px-5 py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-secondary/20 hover:scale-105 transition-all"
                  >
                    تسوقي الآن
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
