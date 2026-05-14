"use client";

import React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const SLIDES = [
  {
    title: "أحدث التقنيات بين يديك",
    subtitle: "تصفح مجموعة واسعة من الأجهزة الإلكترونية الأصلية بأسعار منافسة",
    cta: "تسوق الآن",
    image: PlaceHolderImages.find(img => img.id === 'hero-1'),
    color: "bg-blue-50"
  },
  {
    title: "تألقي بأحدث صيحات الموضة",
    subtitle: "تشكيلة جديدة وحصرية وصلت الآن لتناسب ذوقك الرفيع",
    cta: "اكتشف المجموعة",
    image: PlaceHolderImages.find(img => img.id === 'hero-2'),
    color: "bg-rose-50"
  }
];

export function HeroSlider() {
  return (
    <section className="container mx-auto px-4 py-6 md:py-10">
      <Carousel 
        opts={{
          loop: true,
          direction: 'rtl'
        }}
        className="w-full overflow-hidden rounded-[2rem] shadow-premium group"
      >
        <CarouselContent>
          {SLIDES.map((slide, index) => (
            <CarouselItem key={index}>
              <div className={cn("relative h-[400px] md:h-[550px] w-full flex flex-col md:flex-row items-center overflow-hidden", slide.color)}>
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/40 to-transparent"></div>
                
                <div className="flex-1 p-8 md:p-20 z-10 text-right">
                  <Badge variant="secondary" className="mb-6 bg-white/80 backdrop-blur border-none px-4 py-1 text-primary font-bold">وصل حديثاً</Badge>
                  <h2 className="text-3xl md:text-6xl font-black mb-6 text-slate-900 leading-[1.1] tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-lg leading-relaxed font-medium">
                    {slide.subtitle}
                  </p>
                  <div className="flex gap-4">
                    <Button size="lg" className="rounded-2xl px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                      {slide.cta}
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 relative h-full w-full md:w-auto p-4 md:p-10">
                  <div className="relative h-full w-full">
                    <Image
                      src={slide.image?.imageUrl || ''}
                      alt={slide.title}
                      fill
                      className="object-contain md:scale-110 drop-shadow-2xl"
                      priority={index === 0}
                      data-ai-hint={slide.image?.imageHint}
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <CarouselPrevious className="right-8 left-auto h-12 w-12 bg-white border-none shadow-premium hover:bg-primary hover:text-white" />
          <CarouselNext className="left-8 right-auto h-12 w-12 bg-white border-none shadow-premium hover:bg-primary hover:text-white" />
        </div>
      </Carousel>
    </section>
  );
}

import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
