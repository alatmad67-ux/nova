
"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-white/60 pt-20 pb-24 md:pb-12 border-t border-white/5 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex flex-col group">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-3xl font-bold tracking-[0.2em] gold-text uppercase">NOVA</span>
              </div>
              <span className="text-[10px] font-light tracking-[0.5em] text-white/40 uppercase -mt-1 group-hover:text-primary transition-colors">Women Fashion</span>
            </div>
            <p className="text-sm leading-relaxed font-light">
              وجهتكِ الأولى للأناقة العصرية في العراق. تصاميم حصرية بجودة ملكية تناسب ذوقكِ الرفيع في عالم NOVA.
            </p>
            <div className="flex gap-6">
              <Link href="https://instagram.com" className="text-white/20 hover:text-primary transition-all hover:scale-110"><Instagram className="h-5 w-5" /></Link>
              <Link href="https://facebook.com" className="text-white/20 hover:text-primary transition-all hover:scale-110"><Facebook className="h-5 w-5" /></Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">استكشفي</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors">المتجر</Link></li>
              <li><Link href="/wishlist" className="hover:text-primary transition-colors">المفضلة</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">خدمة العملاء</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/checkout" className="hover:text-primary transition-colors">إتمام الطلب</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">سياسة الإرجاع</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">اتصلي بنا</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold">+964 785 883 3838</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-xs text-white/40">care@novafashion.iq</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em]">
          <p>© 2026 NOVA — WOMEN FASHION. جميع الحقوق محفوظة.</p>
          <div className="flex gap-8 opacity-30">
            <span>Zain Cash</span>
            <span>MasterCard</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
