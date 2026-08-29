
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
  Ticket,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { useCart } from '@/providers/cart-provider';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 5000;
  const total = subtotal + shipping;

  const formatPrice = (price: number) => price.toLocaleString() + ' د.ع';

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white/5 p-16 rounded-[4rem] border border-white/5 celestial-glow max-w-md w-full">
            <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">سلتك فارغة</h2>
            <p className="text-white/40 mb-10 font-light">لا توجد قطع مضافة حالياً، ابدأي باكتشاف أحدث مجموعاتنا</p>
            <Button asChild className="w-full h-16 rounded-full text-lg font-black bg-primary text-black">
              <Link href="/">ابدأ التسوق</Link>
            </Button>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="flex items-center gap-4 mb-12">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl md:text-5xl font-black text-white">حقيبة التسوق</h1>
          <span className="text-sm font-bold bg-primary/20 text-primary px-4 py-1 rounded-full">{cart.length} قطع</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item.variant.sku} className="nova-card p-6 md:p-8 flex gap-6 md:gap-10 items-center">
                <div className="relative h-32 w-24 md:h-44 md:w-32 flex-shrink-0 bg-white/5 rounded-3xl overflow-hidden border border-white/5">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-black text-white text-lg md:text-2xl line-clamp-1">{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.variant.sku)}
                      className="p-2 text-white/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex gap-4 mb-6">
                    <Badge variant="outline" className="border-white/10 text-white/40 font-bold px-3 py-1">اللون: {item.variant.color}</Badge>
                    <Badge variant="outline" className="border-white/10 text-white/40 font-bold px-3 py-1">القياس: {item.variant.size}</Badge>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between gap-6">
                    <div className="flex items-center bg-white/5 rounded-2xl p-1.5 border border-white/5">
                      <button 
                        onClick={() => updateQuantity(item.variant.sku, -1)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-black text-lg text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.variant.sku, 1)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-left">
                      <p className="text-xl md:text-3xl font-black gold-text">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link href="/" className="inline-flex items-center text-primary font-black gap-2 hover:underline p-2 mt-8">
              <ChevronLeft className="h-6 w-6" />
              مواصلة التسوق
            </Link>
          </div>

          {/* Summary */}
          <div className="space-y-8">
            <div className="nova-card p-10 celestial-glow">
              <h3 className="text-2xl font-black text-white mb-10">ملخص الطلب</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between text-white/40 font-bold">
                  <span>المجموع</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/40 font-bold">
                  <span>أجرة التوصيل</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="h-px bg-white/5 my-6" />
                <div className="flex justify-between text-2xl font-black text-white">
                  <span>الإجمالي</span>
                  <span className="gold-text">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mb-10">
                <div className="relative group">
                  <Ticket className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary" />
                  <Input 
                    placeholder="كود الخصم" 
                    className="h-14 pr-12 bg-white/5 border-white/10 rounded-2xl text-white font-bold"
                  />
                  <Button variant="ghost" className="absolute left-2 top-2 h-10 rounded-xl text-primary font-black">تطبيق</Button>
                </div>
              </div>

              <Button asChild size="lg" className="w-full h-16 rounded-full text-xl font-black bg-primary text-black shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                <Link href="/checkout">
                  إتمام الشراء
                  <ArrowRight className="mr-2 h-6 w-6" />
                </Link>
              </Button>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2.5rem] flex items-center gap-6">
              <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center celestial-glow">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm uppercase tracking-widest">توصيل مجاني؟</h4>
                <p className="text-xs text-white/40 font-light mt-1">تسوقي بقيمة 75,000 د.ع إضافية للحصول على توصيل مجاني!</p>
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
