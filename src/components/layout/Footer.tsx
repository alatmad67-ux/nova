
"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="text-2xl font-bold text-white">
              متجر النهرين
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              وجهتك الأولى للتسوق الإلكتروني في العراق. نوفر لك أجود المنتجات العالمية والمحلية بضمان حقيقي وتوصيل سريع.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-primary transition-colors"><Youtube className="h-5 w-5" /></Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6">روابط سريعة</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">من نحن</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">سياسة الخصوصية</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">الشروط والأحكام</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-6">خدمة العملاء</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">تتبع الطلبية</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">سياسة الإرجاع</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">طرق الدفع</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">الشحن والتوصيل</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">اتصل بنا</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span>+964 770 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@nahrainshop.iq</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>بغداد، شارع المنصور</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2024 متجر النهرين. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4 grayscale opacity-50">
            {/* Payment Icons Placeholder */}
            <span className="bg-slate-700 px-3 py-1 rounded">Visa</span>
            <span className="bg-slate-700 px-3 py-1 rounded">MasterCard</span>
            <span className="bg-slate-700 px-3 py-1 rounded">ZainCash</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
