
"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { 
  ChevronLeft, 
  MessageCircle, 
  HelpCircle, 
  Phone, 
  Mail,
  ChevronDown
} from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';

export default function SupportPage() {
  const router = useRouter();
  const db = useFirestore();
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'general') : null, [db]);
  const { data: settings } = useDoc(settingsRef);

  const faqs = [
    { q: "ما هي مدة التوصيل؟", a: "يتم التوصيل خلال 24-48 ساعة داخل بغداد، و3-5 أيام لباقي المحافظات." },
    { q: "كيف يمكنني تتبع طلبي؟", a: "يمكنكِ تتبع حالة الطلب مباشرة من صفحة 'طلباتي' في حسابكِ الشخصي." },
    { q: "هل يوجد استبدال أو استرجاع؟", a: "نعم، يحق لكِ الاستبدال خلال 3 أيام من تاريخ الاستلام في حال وجود أي عيب في الجودة." },
    { q: "ما هي طرق الدفع المتاحة؟", a: "حالياً نوفر خدمة الدفع نقداً عند الاستلام لضمان راحتكِ وثقتكِ." },
  ];

  const handleWhatsApp = () => {
    const phone = settings?.whatsapp || '9647858833838';
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32" dir="rtl">
      <header className="h-20 flex items-center px-6 justify-between bg-white sticky top-0 z-40 border-b border-border/50">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">المساعدة والدعم</h1>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-5 py-8 max-w-lg space-y-10">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 rounded-[2rem] bg-primary/5 flex items-center justify-center mx-auto text-primary">
            <HelpCircle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-primary">كيف يمكننا مساعدتكِ؟</h2>
          <p className="text-sm text-primary/40 font-bold">فريق NOVA هنا دائماً لخدمة أناقتكِ</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button onClick={handleWhatsApp} className="p-6 bg-green-50 rounded-[2rem] border border-green-100 flex flex-col items-center gap-3 transition-transform hover:scale-105">
              <MessageCircle className="h-8 w-8 text-green-500" />
              <span className="text-xs font-black text-green-600">واتساب</span>
           </button>
           <button className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex flex-col items-center gap-3 transition-transform hover:scale-105">
              <Phone className="h-8 w-8 text-blue-500" />
              <span className="text-xs font-black text-blue-600">اتصال مباشر</span>
           </button>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-black text-primary px-2">الأسئلة الشائعة</h3>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none">
                <AccordionTrigger className="bg-white px-6 py-5 rounded-[1.5rem] border border-border/50 font-black text-sm text-primary hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="bg-accent/30 px-6 py-4 rounded-b-[1.5rem] -mt-4 text-xs font-bold text-primary/60 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
