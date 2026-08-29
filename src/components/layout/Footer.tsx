
"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-white/60 pt-20 pb-24 md:pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="space-y-8">
            <div className="flex flex-col group">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-3xl font-bold tracking-[0.2em] gold-text">NOVA</span>
              </div>
              <span className="text-[10px] font-light tracking-[0.5em] text-white/40 uppercase -mt-1 group-hover:text-primary transition-colors">Women Fashion</span>
            </div>
            <p className="text-sm leading-relaxed font-light">
              وجهتكِ الأولى للأناقة العصرية في العراق. تصاميم حصرية بجودة ملكية تناسب ذوقكِ الرفيع في عالم NOVA.
            </p>
            <div className="flex gap-6">
              <Link href="https://instagram.com" className="text-white/20 hover:text-primary transition-all hover:scale-110"><Instagram className="h-5 w-5" /></Link>
              <Link href="https://facebook.com" className="text-white/20 hover:text-primary transition-all hover:scale-110"><Facebook className="h-5 w-5" /></Link>
              <Link href="https://tiktok.com" className="text-white/20 hover:text-primary transition-all hover:scale-110"><svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.14-.32-2.4-.3-3.43.33-.88.54-1.45 1.44-1.63 2.45-.31 1.48.27 3.1 1.47 4.02.73.56 1.64.88 2.57.88.85-.02 1.7-.23 2.46-.62.83-.44 1.47-1.17 1.81-2.03.36-.93.43-1.93.41-2.92V.02z"/></svg></Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">استكشفي</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors">المتجر</Link></li>
              <li><Link href="/wishlist" className="hover:text-primary transition-colors">المفضلة</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">خدمة العملاء</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/checkout" className="hover:text-primary transition-colors">إتمام الطلب</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">سياسة الإرجاع</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          {/* Contact */}
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
            <span>الدفع عند الاستلام</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
