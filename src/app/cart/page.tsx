
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
import { Badge } from "@/components/ui/badge";
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
      <div className="min-h-screen flex flex-col bg-background font-arabic">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-16 rounded-[4rem] border border-border shadow-premium max-w-md w-full">
            <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-primary mb-4">سلتكِ فارغة</h2>
            <p className="text-primary/40 mb-10 font-black">لا توجد قطع مضافة حالياً، ابدأي باكتشاف أحدث مجموعاتنا</p>
            <Button asChild className="w-full h-16 rounded-full text-lg font-black bg-primary text-white shadow-xl shadow-primary/20">
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
    <div className="min-h-screen flex flex-col bg-background font-arabic">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="flex items-center gap-4 mb-12">
          <Sparkles className="h-6 w-6 text-secondary" />
          <h1 className="text-3xl md:text-5xl font-black text-primary">حقيبة التسوق</h1>
          <span className="text-sm font-black bg-primary/5 text-primary px-4 py-1 rounded-full border border-primary/10">{cart.length} قطع</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item.variant.sku} className="nova-card p-6 md:p-8 flex gap-6 md:gap-10 items-center bg-white shadow-sm hover:shadow-md transition-all">
                <div className="relative h-32 w-24 md:h-44 md:w-32 flex-shrink-0 bg-accent rounded-3xl overflow-hidden border border-border">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-black text-primary text-lg md:text-2xl line-clamp-1">{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.variant.sku)}
                      className="p-2 text-primary/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex gap-4 mb-6">
                    <Badge variant="outline" className="border-border text-primary/40 font-black px-3 py-1 bg-accent/30 text-[10px]">اللون: {item.variant.color}</Badge>
                    <Badge variant="outline" className="border-border text-primary/40 font-black px-3 py-1 bg-accent/30 text-[10px]">القياس: {item.variant.size}</Badge>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between gap-6">
                    <div className="flex items-center bg-accent rounded-2xl p-1.5 border border-border">
                      <button 
                        onClick={() => updateQuantity(item.variant.sku, -1)}
                        className="p-2 hover:bg-white rounded-xl transition-all text-primary"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-black text-lg text-primary">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.variant.sku, 1)}
                        className="p-2 hover:bg-white rounded-xl transition-all text-primary"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-left">
                      <p className="text-xl md:text-3xl font-black text-secondary">{formatPrice(item.price * item.quantity)}</p>
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

          <div className="space-y-8">
            <div className="nova-card p-10 bg-white shadow-premium">
              <h3 className="text-2xl font-black text-primary mb-10">ملخص الطلب</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between text-primary/40 font-black">
                  <span>المجموع</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-primary/40 font-black">
                  <span>أجرة التوصيل</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="h-px bg-border my-6" />
                <div className="flex justify-between text-2xl font-black text-primary">
                  <span>الإجمالي</span>
                  <span className="text-secondary">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mb-10">
                <div className="relative group">
                  <Ticket className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-primary" />
                  <Input 
                    placeholder="كود الخصم" 
                    className="h-14 pr-12 bg-accent/30 border-border rounded-2xl text-primary font-black"
                  />
                  <Button variant="ghost" className="absolute left-2 top-2 h-10 rounded-xl text-primary font-black hover:bg-white">تطبيق</Button>
                </div>
              </div>

              <Button asChild size="lg" className="w-full h-16 rounded-full text-xl font-black bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                <Link href="/checkout">
                  إتمام الشراء
                  <ArrowRight className="mr-2 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
