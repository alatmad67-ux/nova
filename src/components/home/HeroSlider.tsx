
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
    color: "bg-blue-600/10"
  },
  {
    title: "تألقي بأحدث صيحات الموضة",
    subtitle: "تشكيلة جديدة وحصرية وصلت الآن لتناسب ذوقك الرفيع",
    cta: "اكتشف المجموعة",
    image: PlaceHolderImages.find(img => img.id === 'hero-2'),
    color: "bg-purple-600/10"
  }
];

export function HeroSlider() {
  return (
    <section className="container mx-auto px-4 py-6">
      <Carousel 
        opts={{
          loop: true,
          direction: 'rtl'
        }}
        className="w-full overflow-hidden rounded-2xl shadow-sm"
      >
        <CarouselContent>
          {SLIDES.map((slide, index) => (
            <CarouselItem key={index}>
              <div className={`relative h-[300px] md:h-[450px] w-full ${slide.color} flex flex-col md:flex-row items-center overflow-hidden`}>
                <div className="flex-1 p-8 md:p-16 z-10 text-right">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-lg">
                    {slide.subtitle}
                  </p>
                  <Button size="lg" className="rounded-full px-8 h-12 text-lg font-medium shadow-lg hover:scale-105 transition-transform">
                    {slide.cta}
                  </Button>
                </div>
                <div className="flex-1 relative h-full w-full md:w-auto overflow-hidden">
                  <Image
                    src={slide.image?.imageUrl || ''}
                    alt={slide.title}
                    fill
                    className="object-cover md:object-contain md:scale-110"
                    priority={index === 0}
                    data-ai-hint={slide.image?.imageHint}
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="right-4 left-auto" />
          <CarouselNext className="left-4 right-auto" />
        </div>
      </Carousel>
    </section>
  );
}
