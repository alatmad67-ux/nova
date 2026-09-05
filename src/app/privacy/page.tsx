
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChevronLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32" dir="rtl">
      <header className="h-20 flex items-center px-6 justify-between bg-white border-b border-border/50">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">سياسة الخصوصية</h1>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-6 py-8 max-w-lg space-y-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-20 w-20 rounded-[2rem] bg-secondary/10 flex items-center justify-center text-secondary">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-primary">بياناتكِ في أمان مع NOVA</h2>
          <p className="text-xs text-primary/40 font-bold leading-relaxed px-4">نحن نلتزم بأعلى معايير الحماية لضمان تجربة تسوق آمنة وخاصة لكل جميلة تختار متجرنا.</p>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Eye className="h-5 w-5 text-secondary" />
              <h3 className="font-black">ما هي المعلومات التي نجمعها؟</h3>
            </div>
            <p className="text-sm text-primary/60 leading-relaxed font-bold">نجمع المعلومات اللازمة فقط لإتمام عملية الطلب، مثل اسمكِ، عنوانكِ، ورقم هاتفكِ لضمان وصول القطع إليكِ بسرعة ودقة.</p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Lock className="h-5 w-5 text-secondary" />
              <h3 className="font-black">كيف نحمي بياناتكِ؟</h3>
            </div>
            <p className="text-sm text-primary/60 leading-relaxed font-bold">نستخدم تقنيات تشفير متطورة وقواعد بيانات Firebase الآمنة لمنع الوصول غير المصرح به لمعلوماتكِ الشخصية.</p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <FileText className="h-5 w-5 text-secondary" />
              <h3 className="font-black">حقوقكِ كزبونة</h3>
            </div>
            <p className="text-sm text-primary/60 leading-relaxed font-bold">لديكِ الحق الكامل في مراجعة بياناتكِ، تعديلها، أو طلب حذف حسابكِ في أي وقت من خلال إعدادات الحساب أو التواصل مع الدعم.</p>
          </section>
        </div>

        <div className="pt-10 text-center opacity-20">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">NOVA SECURITY STANDARDS © 2026</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
