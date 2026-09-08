
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChevronRight, Sparkles, Heart, Award, Globe } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] font-arabic pb-32 transition-colors duration-500" dir="rtl">
      {/* Header */}
      <header className="h-20 flex items-center px-6 justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-border/50 dark:border-zinc-800 sticky top-0 z-40">
        <button 
          onClick={() => router.back()} 
          className="h-10 w-10 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-zinc-300 shadow-sm active:scale-95 transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary dark:text-zinc-100 uppercase tracking-widest">من نحن</h1>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-6 py-12 max-w-lg space-y-20">
        {/* Brand Identity Section */}
        <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="flex flex-col items-center">
            <h2 className="text-4xl font-black text-primary dark:text-zinc-100 tracking-widest mb-2 flex items-center gap-2">
              NOVA <span className="text-secondary text-2xl">✦</span>
            </h2>
            <p className="text-secondary font-black text-xs uppercase tracking-[0.4em]">A world of fashion & beauty</p>
          </div>
          
          <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 bg-accent/30 dark:bg-zinc-900">
            <Image 
              src="https://picsum.photos/seed/nova-philosophy/800/450" 
              alt="NOVA Philosophy" 
              fill 
              className="object-cover dark:brightness-75"
              data-ai-hint="luxury interior store"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>

          <p className="text-lg font-bold text-primary/80 dark:text-zinc-400 leading-relaxed px-2">
            تأسست <span className="text-primary dark:text-zinc-100 font-black">NOVA</span> بشغف لصنع مساحة تجمع الأناقة والجمال والعناية بالمرأة في مكان واحد. نؤمن أن كل قطعة نختارها هي جزء من قصة ثقتكِ وتألقكِ.
          </p>
        </div>

        {/* Founder Section */}
        <div className="bg-primary dark:bg-zinc-900 text-white rounded-[3.5rem] p-10 relative overflow-hidden shadow-xl shadow-primary/20 dark:shadow-none border border-transparent dark:border-zinc-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-10 -mt-10 blur-3xl" />
          <div className="relative z-10 space-y-6 text-center">
            <div className="h-28 w-28 rounded-full border-2 border-secondary mx-auto overflow-hidden bg-white/10 p-1 relative">
               <Image 
                src="https://picsum.photos/seed/founder/300/300" 
                alt="Helen Rustam" 
                fill 
                className="rounded-full object-cover" 
              />
            </div>
            <div>
              <h3 className="text-2xl font-black text-secondary">هيلين رستم</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mt-1 text-white">Founder & Creative Director</p>
            </div>
            <div className="h-px bg-white/10 w-16 mx-auto" />
            <p className="text-sm font-medium leading-relaxed opacity-80 italic">
              "رسالتنا في NOVA هي أن نكون الوجهة الأولى لكل امرأة تبحث عن التميز، الجودة، واللمسة الفنية التي تناسب ذوقها الرفيع."
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6">
          {[
            { icon: Heart, title: "شغف بالأناقة", desc: "نختار كل قطعة بعناية فائقة لتناسب لحظاتكِ المميزة." },
            { icon: Globe, title: "تصاميم عالمية", desc: "نوفر أحدث صيحات الموضة العالمية بين يديكِ في العراق." },
            { icon: Award, title: "جودة مضمونة", desc: "لا نساوم أبداً على جودة الأقمشة ودقة الخياطة." },
          ].map((feat, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-border/50 dark:border-zinc-800 flex gap-6 items-center shadow-sm hover:shadow-md transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-secondary flex-shrink-0 group-hover:bg-primary/5 transition-colors">
                <feat.icon className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-black text-primary dark:text-zinc-100 text-sm">{feat.title}</h4>
                <p className="text-xs text-primary/40 dark:text-zinc-500 font-bold mt-1.5 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Branding */}
        <div className="text-center space-y-2 opacity-30 pt-10 pb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] dark:text-zinc-500 text-primary">NOVA OFFICIAL — EST. 2026</p>
          <p className="text-[10px] font-black italic text-primary/60 dark:text-zinc-600">جميع الحقوق محفوظة © 2026 NOVA</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
