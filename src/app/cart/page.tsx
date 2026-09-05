
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  ChevronLeft,
  Sparkles,
  Package
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { useCart } from '@/providers/cart-provider';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // Shipping is calculated at checkout

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-arabic pb-32">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center text-primary/20 mb-6">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-black text-primary mb-2">حقيبتكِ فارغة</h2>
          <p className="text-sm text-primary/40 font-bold mb-8">اكتشفي أحدث القطع وأضيفي لمسة سحرية لخزانتكِ</p>
          <Button asChild className="h-16 px-12 rounded-3xl bg-primary text-white font-black shadow-xl shadow-primary/20">
            <Link href="/shop">ابدأ التسوق</Link>
          </Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-40">
      <header className="h-20 flex items-center px-6 justify-between bg-white border-b border-border/30">
        <div className="w-10" />
        <h1 className="text-xl font-black text-primary">حقيبة التسوق</h1>
        <button onClick={() => window.history.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
          <ChevronLeft className="h-6 w-6" />
        </button>
      </header>
      
      <main className="flex-grow container mx-auto px-5 py-8 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black text-primary/40 uppercase tracking-widest">{cart.length} قطع في الحقيبة</span>
          <button onClick={() => {/* Clear all cart logic */}} className="text-[10px] font-black text-red-400">تفريغ الحقيبة</button>
        </div>

        {cart.map((item) => (
          <div key={item.variant.sku} className="bg-white rounded-[2.5rem] p-5 border border-border/50 shadow-sm flex gap-5">
            <div className="h-32 w-24 rounded-3xl overflow-hidden bg-accent flex-shrink-0 relative border border-border/30">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-black text-primary line-clamp-1">{item.name}</h3>
                  <button onClick={() => removeFromCart(item.variant.sku)} className="text-primary/10 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-[9px] font-black bg-accent text-primary/60 px-2 py-1 rounded-lg">اللون: {item.variant.color}</span>
                  <span className="text-[9px] font-black bg-accent text-primary/60 px-2 py-1 rounded-lg">القياس: {item.variant.size}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center bg-accent/50 rounded-xl p-1 gap-4">
                  <button onClick={() => updateQuantity(item.variant.sku, -1)} className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm active:scale-95 transition-all"><Minus className="h-3 w-3" /></button>
                  <span className="font-black text-sm text-primary">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.variant.sku, 1)} className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm active:scale-95 transition-all"><Plus className="h-3 w-3" /></button>
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-secondary">{(item.price * item.quantity).toLocaleString()} د.ع</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Summary Float */}
      <div className="fixed bottom-20 left-0 right-0 p-6 bg-white border-t border-border/50 z-40 rounded-t-[3rem] shadow-2xl">
         <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm font-bold text-primary/40">
              <span>المجموع الفرعي</span>
              <span>{subtotal.toLocaleString()} د.ع</span>
            </div>
            <div className="flex justify-between text-lg font-black text-primary pt-2 border-t border-border/30">
              <span>الإجمالي التقديري</span>
              <span className="text-secondary">{total.toLocaleString()} د.ع</span>
            </div>
            <p className="text-[10px] text-primary/30 font-bold text-center">أجور التوصيل تُحسب في الخطوة التالية</p>
         </div>
         <Button asChild className="w-full h-16 rounded-3xl bg-primary text-white text-xl font-black shadow-xl shadow-primary/20">
            <Link href="/checkout">
              إتمام الطلبية
              <ArrowRight className="mr-3 h-6 w-6" />
            </Link>
         </Button>
      </div>

      <BottomNav />
    </div>
  );
}
