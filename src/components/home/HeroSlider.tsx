
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
        title: "أناقتكِ تبدأ من هنا", 
        subtitle: "اكتشفي أحدث تشكيلات الموسم", 
        image: "https://picsum.photos/seed/nova-h1/1200/800",
        link: "/shop"
      }
    ];
    return [...slides].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [slides, loading]);

  if (loading) return (
    <section className="container mx-auto px-5 py-2">
      <div className="w-full h-[200px] rounded-[2.5rem] bg-accent/20 animate-pulse" />
    </section>
  );

  return (
    <section className="container mx-auto px-5 py-2">
      <Carousel 
        opts={{ loop: true, direction: 'rtl' }}
        plugins={[Autoplay({ delay: 5000 })]}
        className="w-full overflow-hidden rounded-[2.5rem] bg-accent/30 shadow-sm"
      >
        <CarouselContent>
          {sortedSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <Link href={slide.link || "/shop"} className="block relative h-[180px] md:h-[400px] w-full overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-primary/30 to-transparent flex flex-col justify-center p-8">
                  <h2 className="text-xl md:text-4xl font-black text-white mb-1 drop-shadow-md">
                    {slide.title}
                  </h2>
                  <p className="text-[10px] md:text-lg text-white/90 font-bold drop-shadow-md">
                    {slide.subtitle}
                  </p>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {sortedSlides.map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/40" />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
