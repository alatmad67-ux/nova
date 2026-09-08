
"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChevronRight, Heart, Globe, Award, Sparkles } from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';

export default function AboutPage() {
  const router = useRouter();
  const db = useFirestore();
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'general') : null, [db]);
  const { data: settings } = useDoc(settingsRef);

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32" dir="rtl">
      <header className="h-20 flex items-center px-6 justify-between bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary shadow-sm active:scale-95 transition-all">
          <ChevronRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">من نحن</h1>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-6 py-12 max-w-lg space-y-16">
        {/* Brand Identity Section */}
        <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="flex flex-col items-center">
            <h2 className="text-4xl font-black text-primary tracking-widest mb-2 flex items-center gap-2">
              NOVA <span className="text-secondary text-2xl">✦</span>
            </h2>
            <p className="text-secondary font-black text-xs uppercase tracking-[0.4em]">A world of fashion & beauty</p>
          </div>
          
          <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-accent/30">
            <Image 
              src="https://picsum.photos/seed/nova-philosophy/800/450" 
              alt="NOVA Philosophy" 
              fill 
              className="object-cover"
              data-ai-hint="luxury interior store"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>

          <p className="text-lg font-bold text-primary/80 leading-relaxed px-2">
            تأسست NOVA بشغف لصنع مساحة تجمع الأناقة والجمال والعناية بالمرأة في مكان واحد. نؤمن أن كل قطعة نختارها هي جزء من قصة ثقتكِ وتألقكِ.
          </p>
        </div>

        {/* Founder Section */}
        <div className="bg-primary text-white rounded-[3.5rem] p-10 relative overflow-hidden shadow-xl shadow-primary/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-10 -mt-10 blur-3xl" />
          <div className="relative z-10 space-y-6 text-center">
            <div className="h-24 w-24 rounded-full border-2 border-secondary mx-auto overflow-hidden bg-white/10 p-1 relative">
               <Image src="https://picsum.photos/seed/founder/200/200" alt="Helen Rustam" fill className="rounded-full object-cover" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-secondary">هيلين رستم</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mt-1">Founder & Creative Director</p>
            </div>
            <div className="h-px bg-white/10 w-16 mx-auto" />
            <p className="text-sm font-medium leading-relaxed opacity-80 italic">
              "رسالتنا في NOVA هي أن نكون الوجهة الأولى لكل امرأة تبحث عن التميز، الجودة، واللمسة الفنية التي تناسب ذوقها الرفيع."
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-6">
          {[
            { icon: Heart, title: "شغف بالأناقة", desc: "نختار كل قطعة بعناية فائقة لتناسب لحظاتكِ المميزة." },
            { icon: Globe, title: "تصاميم عالمية", desc: "نوفر أحدث صيحات الموضة العالمية بين يديكِ في العراق." },
            { icon: Award, title: "جودة مضمونة", desc: "لا نساوم أبداً على جودة الأقمشة ودقة الخياطة." },
          ].map((feat, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-border/50 flex gap-6 items-center shadow-sm hover:shadow-md transition-shadow group">
              <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center text-secondary flex-shrink-0 group-hover:bg-primary/5 transition-colors">
                <feat.icon className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-black text-primary text-sm">{feat.title}</h4>
                <p className="text-xs text-primary/40 font-bold mt-1.5 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center space-y-2 opacity-30 pt-10 pb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">NOVA OFFICIAL — EST. 2026</p>
          <p className="text-[10px] font-black italic text-primary/60">جميع الحقوق محفوظة © 2026 NOVA</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
