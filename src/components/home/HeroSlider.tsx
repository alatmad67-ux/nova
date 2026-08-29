
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    title: "سحر النجوم في أزيائك",
    subtitle: "اكتشفي تشكيلة فساتين السهرة الحصرية لإطلالة ملكية لا تُنسى",
    cta: "تسوقي الآن",
    image: "https://picsum.photos/seed/nova-h1/1200/800",
    hint: "luxury fashion evening dress"
  },
  {
    title: "أطقم عملية وأنيقة",
    subtitle: "كوني متميزة في كل وقت مع مجموعتنا اليومية الجديدة",
    cta: "اكتشفي المزيد",
    image: "https://picsum.photos/seed/nova-h2/1200/800",
    hint: "casual elegant women set"
  }
];

export function HeroSlider() {
  return (
    <section className="container mx-auto px-4 py-4 md:py-8">
      <Carousel 
        opts={{ loop: true, direction: 'rtl' }}
        className="w-full overflow-hidden rounded-[2.5rem] celestial-glow group border border-white/5"
      >
        <CarouselContent>
          {SLIDES.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[450px] md:h-[650px] w-full flex flex-col md:flex-row items-center overflow-hidden bg-[#050505]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(226,179,188,0.1),transparent)] pointer-events-none" />
                
                <div className="flex-1 p-8 md:p-24 z-10 text-right">
                  <Badge variant="outline" className="mb-6 border-primary/50 text-primary font-bold px-4 py-1">مجموعة الشتاء 2024</Badge>
                  <h2 className="text-4xl md:text-7xl font-black mb-6 gold-text leading-[1.1] tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl text-white/60 mb-10 max-w-lg leading-relaxed font-light">
                    {slide.subtitle}
                  </p>
                  <Button asChild size="lg" className="rounded-full px-10 h-16 text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/80 transition-all hover:scale-105">
                    <Link href="/shop">{slide.cta}</Link>
                  </Button>
                </div>
                
                <div className="flex-1 relative h-full w-full md:w-auto overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover opacity-80"
                    priority={index === 0}
                    data-ai-hint={slide.hint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent md:block hidden" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:hidden block" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
