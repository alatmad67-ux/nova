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
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSlider() {
  const db = useFirestore();
  const { storeId } = useStore();

  const sliderQuery = useMemo(() => query(
    collection(db, 'slider'), 
    where('storeId', '==', storeId), 
    where('isActive', '==', true)
  ), [db, storeId]);
  
  const { data: slides } = useCollection(sliderQuery);

  const sortedSlides = useMemo(() => {
    if (!slides || slides.length === 0) return [
      { 
        title: "أناقتكِ تبدأ من هنا", 
        subtitle: "اكتشفي أحدث تشكيلات الأزياء النسائية للموسم الجديد", 
        image: "https://picsum.photos/seed/nova-h1/1200/800",
        link: "/shop"
      }
    ];
    return [...slides].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [slides]);

  return (
    <section className="container mx-auto px-4 py-6 md:py-10">
      <Carousel 
        opts={{ loop: true, direction: 'rtl' }}
        className="w-full overflow-hidden rounded-[2.5rem] bg-accent/30 relative group"
      >
        <CarouselContent>
          {sortedSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[400px] md:h-[600px] w-full flex items-center overflow-hidden">
                <div className="flex-1 p-8 md:p-24 z-10 text-right">
                  <h2 className="text-4xl md:text-7xl font-black mb-6 text-primary leading-[1.1] animate-in fade-in slide-in-from-right-10 duration-700">
                    {slide.title}
                  </h2>
                  <p className="text-base md:text-xl text-primary/60 mb-10 max-w-lg leading-relaxed font-medium animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
                    {slide.subtitle}
                  </p>
                  <Button asChild size="lg" className="rounded-2xl px-12 h-14 text-lg font-bold bg-primary text-white hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/10">
                    <Link href={slide.link || "/shop"}>تسوقي الآن</Link>
                  </Button>
                </div>
                
                <div className="flex-1 relative h-full w-full hidden md:block">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    data-ai-hint="fashion model"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-transparent to-transparent" />
                </div>

                {/* Mobile Background Image */}
                <div className="md:hidden absolute inset-0 -z-0 opacity-20">
                  <Image src={slide.image} alt="bg" fill className="object-cover" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-10 right-24 hidden md:flex gap-4">
          <CarouselPrevious className="relative left-0 top-0 translate-y-0 h-10 w-10 border-primary/20 text-primary hover:bg-primary hover:text-white" />
          <CarouselNext className="relative right-0 top-0 translate-y-0 h-10 w-10 border-primary/20 text-primary hover:bg-primary hover:text-white" />
        </div>
      </Carousel>
    </section>
  );
}