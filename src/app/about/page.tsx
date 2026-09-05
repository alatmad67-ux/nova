
"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChevronLeft, Sparkles, Heart, Globe, Award } from 'lucide-react';
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
      <header className="h-20 flex items-center px-6 justify-between bg-white border-b border-border/50">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">عن NOVA</h1>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-6 py-8 max-w-lg space-y-12">
        <div className="text-center space-y-6">
          <div className="relative h-24 w-40 mx-auto">
             {settings?.logo ? (
               <Image src={settings.logo} alt="NOVA" fill className="object-contain" />
             ) : (
               <div className="flex flex-col items-center">
                 <span className="text-4xl font-black text-primary tracking-widest">NOVA</span>
                 <span className="text-[10px] text-secondary font-bold uppercase tracking-[0.4em]">Official</span>
               </div>
             )}
          </div>
          <p className="text-sm font-black text-primary leading-relaxed px-4">
            بدأت NOVA كحلم لتقديم تجربة أزياء نسائية فاخرة تجمع بين الأناقة العالمية والذوق الرفيع للمرأة العراقية.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[
            { icon: Heart, title: "شغف بالأناقة", desc: "نختار كل قطعة بعناية فائقة لتناسب لحظاتكِ المميزة." },
            { icon: Globe, title: "تصاميم عالمية", desc: "نوفر أحدث صيحات الموضة العالمية بين يديكِ في العراق." },
            { icon: Award, title: "جودة مضمونة", desc: "لا نساوم أبداً على جودة الأقمشة ودقة الخياطة." },
          ].map((feat, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-6 border border-border/50 flex gap-5 items-center shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                <feat.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-black text-primary text-sm">{feat.title}</h4>
                <p className="text-xs text-primary/40 font-bold mt-1 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary text-white rounded-[3rem] p-8 text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <Sparkles className="h-8 w-8 text-secondary mx-auto" />
          <h3 className="text-xl font-black">رسالتنا</h3>
          <p className="text-xs text-white/70 leading-relaxed font-medium">
            أن نكون الوجهة الأولى لكل امرأة تبحث عن التميز، الثقة، والجمال في كل قطعة ترتديها.
          </p>
        </div>

        <div className="text-center space-y-2 opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Version 1.2.0 - Iraq</p>
          <p className="text-[10px] font-black">جميع الحقوق محفوظة © 2026 NOVA</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
