
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  User, 
  Truck, 
  CreditCard,
  CheckCircle2,
  MessageCircle,
  ChevronLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const PROVINCES = [
  "بغداد", "البصرة", "نينوى", "أربيل", "النجف", "كربلاء", "ذي قار", "بابل", "الأنبار", "كركوك", "ديالى", "صلاح الدين", "المثنى", "القادسية", "ميسان", "واسط", "السليمانية", "دهوك"
];

export default function CheckoutPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    province: 'بغداد',
    address: ''
  });

  const handlePlaceOrder = () => {
    // Simple validation
    if (!formData.name || !formData.phone || !formData.address) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppCheckout = () => {
    const message = `طلب جديد من متجر النهرين:\n\nالاسم: ${formData.name}\nالهاتف: ${formData.phone}\nالمحافظة: ${formData.province}\nالعنوان: ${formData.address}\nطريقة الدفع: ${paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'}\n\nيرجى التواصل لتأكيد الطلب.`;
    window.open(`https://wa.me/9647701234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full animate-in zoom-in-95 duration-500">
            <div className="bg-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4">تم استلام طلبك بنجاح!</h1>
            <p className="text-slate-500 mb-10 leading-relaxed text-lg">شكراً لتسوقك معنا. رقم طلبك هو <span className="font-bold text-slate-900">#NH-9284</span>. سنقوم بالتواصل معك قريباً لتأكيد الطلب وشحنه.</p>
            
            <div className="space-y-4">
              <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold">
                <Link href="/">العودة للرئيسية</Link>
              </Button>
              <Button 
                onClick={handleWhatsAppCheckout}
                variant="outline" 
                className="w-full h-14 rounded-2xl text-lg font-bold border-2 border-green-500 text-green-600 hover:bg-green-50 gap-3"
              >
                <MessageCircle className="h-6 w-6 fill-green-600 text-white" />
                متابعة الطلب عبر واتساب
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-2 text-slate-500 mb-8 overflow-hidden">
          <Link href="/cart" className="hover:text-primary transition-colors flex items-center gap-1 font-bold">
            السلة
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="text-slate-900 font-black">الدفع والشحن</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Checkout Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* Shipping Info */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <MapPin className="h-6 w-6 text-primary" />
                معلومات التوصيل
              </h2>
              
              <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-white space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold pr-1">الاسم الكامل *</Label>
                    <div className="relative group">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input 
                        placeholder="أدخل اسمك بالكامل" 
                        className="h-12 pr-12 bg-slate-50 border-none rounded-xl font-medium focus:bg-white transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold pr-1">رقم الهاتف *</Label>
                    <div className="relative group">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input 
                        placeholder="0770 123 4567" 
                        className="h-12 pr-12 bg-slate-50 border-none rounded-xl font-medium focus:bg-white transition-all text-left dir-ltr"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold pr-1">المحافظة *</Label>
                    <select 
                      className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                    >
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold pr-1">العنوان التفصيلي *</Label>
                    <Input 
                      placeholder="اسم الحي، الزقاق، الدار، أو أقرب نقطة دالة" 
                      className="h-12 bg-slate-50 border-none rounded-xl font-medium focus:bg-white transition-all"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </Card>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                طريقة الدفع
              </h2>
              
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={cn(
                  "relative flex items-center gap-4 p-6 rounded-[2rem] border-2 cursor-pointer transition-all bg-white",
                  paymentMethod === 'cod' ? "border-primary shadow-lg shadow-primary/5" : "border-transparent shadow-premium grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                )} onClick={() => setPaymentMethod('cod')}>
                  <RadioGroupItem value="cod" id="cod" className="sr-only" />
                  <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="cod" className="text-lg font-black block cursor-pointer">الدفع عند الاستلام</Label>
                    <span className="text-xs text-slate-500 font-bold">ادفع نقداً للمندوب عند وصول طلبك</span>
                  </div>
                  {paymentMethod === 'cod' && <CheckCircle2 className="h-6 w-6 text-primary" />}
                </div>

                <div className={cn(
                  "relative flex items-center gap-4 p-6 rounded-[2rem] border-2 cursor-pointer transition-all bg-white",
                  paymentMethod === 'online' ? "border-primary shadow-lg shadow-primary/5" : "border-transparent shadow-premium grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                )} onClick={() => setPaymentMethod('online')}>
                  <RadioGroupItem value="online" id="online" className="sr-only" />
                  <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="online" className="text-lg font-black block cursor-pointer">دفع إلكتروني</Label>
                    <span className="text-xs text-slate-500 font-bold">بواسطة زين كاش أو ماستر كارد</span>
                  </div>
                  {paymentMethod === 'online' && <CheckCircle2 className="h-6 w-6 text-primary" />}
                </div>
              </RadioGroup>
            </section>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <Card className="p-8 border-none shadow-premium rounded-[2.5rem] bg-white">
                <h3 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-50 pb-4">موجز الطلب</h3>
                
                {/* Items Preview */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="h-16 w-16 relative rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={PlaceHolderImages.find(p => p.id === 'prod-1')?.imageUrl || ''} alt="Product" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">سماعات الرأس اللاسلكية برو</p>
                      <p className="text-xs text-slate-500">الكمية: 1</p>
                    </div>
                    <p className="font-black text-slate-900 text-sm whitespace-nowrap">125,000 د.ع</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>المجموع الفرعي</span>
                    <span>125,000 د.ع</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>أجرة التوصيل</span>
                    <span>5,000 د.ع</span>
                  </div>
                  <div className="h-px bg-slate-50 my-4" />
                  <div className="flex justify-between text-2xl font-black text-slate-900">
                    <span>الإجمالي</span>
                    <span className="text-primary">130,000 د.ع</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceOrder}
                  size="lg" 
                  className="w-full h-16 rounded-[1.25rem] text-xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform mb-4"
                >
                  تأكيد الطلب الآن
                </Button>

                <Button 
                  onClick={handleWhatsAppCheckout}
                  variant="outline"
                  size="lg" 
                  className="w-full h-16 rounded-[1.25rem] text-lg font-black border-2 border-green-500 text-green-600 hover:bg-green-50 gap-3"
                >
                  <MessageCircle className="h-6 w-6 fill-green-600 text-white" />
                  طلب عبر واتساب
                </Button>

                <div className="mt-8 flex items-center justify-center gap-3 text-slate-400 grayscale opacity-60">
                   <span className="text-[10px] font-bold">ضمان 100%</span>
                   <div className="h-1 w-1 bg-slate-200 rounded-full" />
                   <span className="text-[10px] font-bold">تشفير آمن</span>
                   <div className="h-1 w-1 bg-slate-200 rounded-full" />
                   <span className="text-[10px] font-bold">صنع في العراق</span>
                </div>
              </Card>

              {/* Promo Banner */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
                <h4 className="text-lg font-black mb-2 relative z-10">توصيل سريع لكل العراق</h4>
                <p className="text-sm text-slate-400 mb-0 relative z-10">استمتع بتوصيل لباب بيتك خلال 24-48 ساعة عمل فقط.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
