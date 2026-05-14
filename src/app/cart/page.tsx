
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Ticket,
  ChevronLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

// Mock cart items
const INITIAL_CART = [
  {
    id: '1',
    name: 'سماعات الرأس اللاسلكية برو - الإصدار البلاتيني',
    price: 125000,
    quantity: 1,
    image: PlaceHolderImages.find(p => p.id === 'prod-1')?.imageUrl || '',
    category: 'إلكترونيات'
  },
  {
    id: '2',
    name: 'ساعة ذكية الإصدار السابع',
    price: 85000,
    quantity: 2,
    image: PlaceHolderImages.find(p => p.id === 'prod-2')?.imageUrl || '',
    category: 'إلكترونيات'
  }
];

export default function CartPage() {
  const [items, setItems] = useState(INITIAL_CART);
  const [coupon, setCoupon] = useState('');

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 5000;
  const total = subtotal + shipping;

  const formatPrice = (price: number) => price.toLocaleString() + ' د.ع';

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-12 rounded-[3rem] shadow-premium max-w-md w-full">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">سلة التسوق فارغة</h2>
            <p className="text-slate-500 mb-8">يبدو أنك لم تضف أي منتجات إلى سلتك بعد.</p>
            <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold">
              <Link href="/">ابدأ التسوق الآن</Link>
            </Button>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          سلة التسوق
          <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{items.length} منتجات</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4 md:p-6 border-none shadow-premium rounded-[2rem] overflow-hidden group">
                <div className="flex gap-4 md:gap-6">
                  <div className="relative h-24 w-24 md:h-32 md:w-32 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  
                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.category}</span>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 text-sm md:text-lg mb-2 line-clamp-1">{item.name}</h3>
                    
                    <div className="mt-auto flex items-center justify-between gap-4">
                      <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 md:p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-black text-slate-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 md:p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-left">
                        <p className="text-lg md:text-xl font-black text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-slate-400 font-bold">{formatPrice(item.price)} للقطعة</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Link href="/" className="inline-flex items-center text-primary font-bold gap-2 hover:underline p-2 mt-4 transition-all">
              <ChevronLeft className="h-5 w-5" />
              مواصلة التسوق
            </Link>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 md:p-8 border-none shadow-premium rounded-[2.5rem] bg-white">
              <h3 className="text-xl font-black text-slate-900 mb-6">ملخص الطلب</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>أجرة التوصيل</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="h-px bg-slate-100 my-4" />
                <div className="flex justify-between text-xl font-black text-slate-900">
                  <span>الإجمالي</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mb-8">
                <div className="relative group">
                  <Ticket className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="كود الخصم" 
                    className="h-12 pr-12 pl-4 bg-slate-50 border-none rounded-xl focus:bg-white transition-all text-sm font-bold"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <Button variant="ghost" className="absolute left-1 top-1.5 h-9 rounded-lg text-primary font-bold hover:bg-primary/5">تطبيق</Button>
                </div>
              </div>

              <Button asChild size="lg" className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                <Link href="/checkout">
                  إتمام الشراء
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Link>
              </Button>

              <p className="text-center text-[10px] text-slate-400 mt-6 font-medium">
                بالضغط على إتمام الشراء، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.
              </p>
            </Card>

            <div className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">شحن مجاني؟</h4>
                <p className="text-xs text-slate-500">أضف 75,000 د.ع إضافية للحصول على شحن مجاني!</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
