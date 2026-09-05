"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Phone, Mail, Sparkles, MapPin, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';

export function Footer() {
  const db = useFirestore();
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'general') : null, [db]);
  const { data: settings } = useDoc(settingsRef);

  return (
    <footer className="bg-primary text-white pt-20 pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 pb-20 border-b border-white/10">
          <div className="flex flex-col items-center text-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-secondary/20 transition-colors">
              <Truck className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h5 className="font-bold text-sm mb-1">شحن مجاني</h5>
              <p className="text-[10px] text-white/40">للطلبات فوق 75,000 د.ع</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-secondary/20 transition-colors">
              <ShieldCheck className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h5 className="font-bold text-sm mb-1">دفع آمن</h5>
              <p className="text-[10px] text-white/40">100% حماية لبياناتك</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-secondary/20 transition-colors">
              <RotateCcw className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h5 className="font-bold text-sm mb-1">إرجاع سهل</h5>
              <p className="text-[10px] text-white/40">خلال 3 أيام من الاستلام</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-secondary/20 transition-colors">
              <Phone className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h5 className="font-bold text-sm mb-1">دعم 24/7</h5>
              <p className="text-[10px] text-white/40">نحن هنا لخدمتكِ دائماً</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <Link href="/" className="flex flex-col group">
              {settings?.logo ? (
                <div className="relative h-12 w-32 invert">
                  <Image src={settings.logo} alt="NOVA" fill className="object-contain" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <span className="text-3xl font-black tracking-[0.2em] text-white uppercase">NOVA</span>
                </div>
              )}
            </Link>
            <p className="text-sm leading-relaxed text-white/60 font-medium">
              أجمل الأزياء النسائية بأحدث التصاميم وأفضل الأسعار لخدمة أناقتكِ.
            </p>
          </div>

          <div>
            <h4 className="text-secondary font-black text-xs uppercase tracking-widest mb-8">تسوقي</h4>
            <ul className="space-y-4 text-sm font-bold text-white/60">
              <li><Link href="/shop" className="hover:text-white transition-colors">جميع المنتجات</Link></li>
              <li><Link href="/shop?cat=dresses" className="hover:text-white transition-colors">فساتين</Link></li>
              <li><Link href="/shop?cat=sets" className="hover:text-white transition-colors">بلوزات</Link></li>
              <li><Link href="/shop?cat=accessories" className="hover:text-white transition-colors">تنانير</Link></li>
              <li><Link href="/shop?cat=shoes" className="hover:text-white transition-colors">أحذية</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-secondary font-black text-xs uppercase tracking-widest mb-8">معلومات</h4>
            <ul className="space-y-4 text-sm font-bold text-white/60">
              <li><Link href="/about" className="hover:text-white transition-colors">من نحن</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">سياسة الشحن</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">سياسة الإرجاع</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">تواصلوا معنا</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-secondary font-black text-xs uppercase tracking-widest mb-8">توصلي معنا</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex items-center gap-4">
                <Instagram className="h-5 w-5 text-secondary" />
                <Facebook className="h-5 w-5 text-secondary" />
                <Phone className="h-5 w-5 text-secondary" />
              </li>
              <li className="text-white/60 font-bold">{settings?.whatsapp || '+964 780 123 4567'}</li>
              <li className="text-white/40 text-xs font-medium">info@nova-fashion.com</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          <p>جميع الحقوق محفوظة © 2026 NOVA — WOMEN FASHION</p>
        </div>
      </div>
    </footer>
  );
}
