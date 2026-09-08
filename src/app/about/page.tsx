"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChevronRight, Sparkles, Heart, Award, Globe, Quote, Star } from 'lucide-react';

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

      <main className="container mx-auto px-6 py-12 max-w-lg space-y-16">
        {/* Brand Identity Section */}
        <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="flex flex-col items-center">
            <h2 className="text-5xl font-black text-primary dark:text-zinc-100 tracking-widest mb-2 flex items-center gap-2">
              NOVA <span className="text-secondary text-3xl">✦</span>
            </h2>
            <p className="text-secondary font-black text-[10px] uppercase tracking-[0.5em]">A world of fashion & beauty</p>
          </div>
          
          <div className="relative py-14 px-8 bg-primary/5 dark:bg-zinc-900 rounded-[3.5rem] border border-primary/10 dark:border-zinc-800 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-secondary/10 transition-all" />
            <Sparkles className="h-12 w-12 text-secondary mx-auto mb-8 opacity-40" />
            <p className="text-2xl font-bold text-primary dark:text-zinc-200 leading-relaxed relative z-10">
              تأسست <span className="text-primary dark:text-white font-black">NOVA</span> بشغف لصنع مساحة تجمع الأناقة والجمال والعناية بالمرأة في مكان واحد. نؤمن أن كل قطعة نختارها هي جزء من قصة ثقتكِ وتألقكِ.
            </p>
          </div>
        </div>

        {/* Founder Section - Specially Highlighted */}
        <div className="bg-primary dark:bg-zinc-900 text-white rounded-[4rem] p-12 relative overflow-hidden shadow-2xl shadow-primary/20 dark:shadow-none border border-transparent dark:border-zinc-800">
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full -mr-24 -mt-24 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl" />
          
          <div className="relative z-10 space-y-10 text-center">
            <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-2">
              <Quote className="h-8 w-8 text-secondary fill-secondary" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-secondary tracking-tight drop-shadow-sm">هيلين رستم</h3>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px bg-white/20 w-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Founder & Creative Director</p>
                <div className="h-px bg-white/20 w-8" />
              </div>
            </div>
            
            <div className="h-px bg-white/10 w-24 mx-auto" />
            
            <p className="text-lg font-medium leading-relaxed opacity-90 italic px-4">
              "رسالتنا في NOVA هي أن نكون الوجهة الأولى لكل امرأة تبحث عن التميز، الجودة، واللمسة الفنية التي تناسب ذوقها الرفيع."
            </p>

            <div className="flex justify-center gap-1.5 pt-4">
               {[1, 2, 3].map(i => <Star key={i} className="h-4 w-4 text-secondary fill-secondary opacity-40" />)}
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-6">
          {[
            { icon: Heart, title: "شغف بالأناقة", desc: "نختار كل قطعة بعناية فائقة لتناسب لحظاتكِ المميزة." },
            { icon: Globe, title: "تصاميم عالمية", desc: "نوفر أحدث صيحات الموضة العالمية بين يديكِ في العراق." },
            { icon: Award, title: "جودة مضمونة", desc: "لا نساوم أبداً على جودة الأقمشة ودقة الخياطة." },
          ].map((feat, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-border/50 dark:border-zinc-800 flex gap-6 items-center shadow-sm hover:shadow-md transition-all group">
              <div className="h-16 w-16 rounded-2xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-secondary flex-shrink-0 group-hover:bg-primary/5 transition-colors">
                <feat.icon className="h-8 w-8" />
              </div>
              <div className="text-right">
                <h4 className="font-black text-primary dark:text-zinc-100 text-base">{feat.title}</h4>
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