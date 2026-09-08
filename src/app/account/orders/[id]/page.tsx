
"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  ChevronRight, 
  Package, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock,
  HelpCircle,
  Smartphone,
  Info,
  Calendar,
  Sparkles,
  XCircle,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const orderRef = useMemo(() => (db && id) ? doc(db, 'orders', id as string) : null, [db, id]);
  const { data: order, loading } = useDoc(orderRef);

  // تعريف مراحل الطلب بدقة لضمان التتبع المستمر
  const steps = [
    { label: 'طلب جديد', key: 'جديد' },
    { label: 'تم التأكيد', key: 'تم التأكيد' },
    { label: 'قيد التجهيز', key: 'قيد التجهيز' },
    { label: 'في الطريق', key: 'تم الشحن' },
    { label: 'تم التسليم', key: 'تم التسليم' },
  ];

  // دالة لتحديد ما إذا كانت المرحلة مكتملة بناءً على الترتيب التصاعدي
  const getStepStatus = (stepKey: string) => {
    const statusOrder = ['جديد', 'تم التأكيد', 'قيد التجهيز', 'تم الشحن', 'تم التسليم'];
    const currentIndex = statusOrder.indexOf(order?.status || 'جديد');
    const stepIndex = statusOrder.indexOf(stepKey);
    
    if (order?.status === 'ملغي') return 'cancelled';
    if (currentIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  if (loading) return (
    <div className="min-h-screen bg-background dark:bg-[#050505] flex flex-col items-center justify-center font-black text-primary dark:text-zinc-100 animate-pulse">
      <Sparkles className="h-10 w-10 mb-4 text-secondary" />
      جاري جلب تفاصيل طلبيتكِ الملكية...
    </div>
  );
  
  if (!order) return <div className="min-h-screen bg-background dark:bg-[#050505] flex items-center justify-center font-black text-primary dark:text-zinc-100">الطلب غير موجود</div>;

  const isCancelled = order.status === 'ملغي';

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] font-arabic pb-32" dir="rtl">
      {/* Header */}
      <header className="h-20 flex items-center px-6 justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-border/50 dark:border-zinc-800">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-zinc-300 shadow-sm">
          <ChevronRight className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-center">
           <h1 className="text-sm font-black text-primary dark:text-zinc-100">تفاصيل الطلب</h1>
           <span className="text-[10px] font-bold text-primary/30 dark:text-zinc-500 uppercase tracking-widest">#{order.orderNumber}</span>
        </div>
        <button onClick={() => window.open('https://wa.me/9647858833838', '_blank')} className="h-10 w-10 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-zinc-300">
          <HelpCircle className="h-5 w-5" />
        </button>
      </header>

      <main className="container mx-auto px-5 py-8 space-y-8 max-w-lg">
        
        {/* Status Highlight Banner */}
        {isCancelled ? (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-6 rounded-[2.5rem] flex items-center gap-5">
             <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                <XCircle className="h-6 w-6" />
             </div>
             <div>
                <h4 className="font-black text-red-600 dark:text-red-400">تم إلغاء الطلبية</h4>
                <p className="text-[10px] font-bold text-red-500/60 dark:text-red-400/60 leading-tight">يرجى التواصل مع الدعم لمزيد من التفاصيل أو لإعادة الطلب.</p>
             </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-border/50 dark:border-zinc-800">
             <div className="flex justify-between items-center mb-8 px-2">
                <h3 className="text-sm font-black text-primary dark:text-zinc-100">تتبع مسار الشحنة</h3>
                <Badge variant="outline" className="bg-primary/5 text-primary dark:text-zinc-100 border-primary/10 text-[10px] px-3 font-black">{order.status}</Badge>
             </div>
             
             <div className="relative flex justify-between items-start">
               {/* Line Connector */}
               <div className="absolute top-5 left-8 right-8 h-0.5 bg-accent dark:bg-zinc-800 -z-0" />
               <div 
                 className="absolute top-5 right-8 h-0.5 bg-primary transition-all duration-1000 -z-0" 
                 style={{ 
                   width: isCancelled ? '0%' : `${(steps.findIndex(s => s.key === order.status) / (steps.length - 1)) * 80}%` 
                 }}
               />

               {steps.map((step, idx) => {
                 const stepStatus = getStepStatus(step.key);
                 return (
                   <div key={idx} className="flex flex-col items-center gap-3 relative z-10 flex-1">
                     <div className={cn(
                       "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500 border-4 border-white dark:border-zinc-900",
                       stepStatus === 'completed' ? "bg-primary text-white shadow-lg" : "bg-accent dark:bg-zinc-800 text-primary/20 dark:text-zinc-700",
                       order.status === step.key && "animate-pulse ring-4 ring-primary/10"
                     )}>
                       {idx === 0 ? <Clock className="h-4 w-4" /> : 
                        idx === 1 ? <CheckCircle2 className="h-4 w-4" /> :
                        idx === 2 ? <Package className="h-4 w-4" /> : 
                        idx === 3 ? <Truck className="h-4 w-4" /> : 
                        <Sparkles className="h-4 w-4" />}
                     </div>
                     <span className={cn(
                       "text-[9px] font-black text-center leading-tight transition-colors",
                       stepStatus === 'completed' ? "text-primary dark:text-zinc-100" : "text-primary/20 dark:text-zinc-700"
                     )}>
                       {step.label}
                     </span>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-sm font-black text-primary dark:text-zinc-100 flex items-center gap-2">
               <Package className="h-4 w-4 text-secondary" /> المنتجات المطلوبة
             </h3>
             <Badge className="bg-accent dark:bg-zinc-800 text-primary dark:text-zinc-100 border-none font-black text-[10px]">{order.items?.length || 0} قطع</Badge>
          </div>
          
          <div className="space-y-3">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 flex gap-5 border border-border/30 dark:border-zinc-800 shadow-sm group">
                <div className="h-24 w-20 bg-[#FAF8F5] dark:bg-zinc-800 rounded-2xl overflow-hidden relative border border-border/20 dark:border-zinc-700 flex-shrink-0">
                   {item.image ? (
                     <Image src={item.image} alt={item.name} fill className="object-contain p-1.5 transition-transform group-hover:scale-110" />
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-primary/10 dark:text-zinc-800"><Package className="h-6 w-6" /></div>
                   )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="text-sm font-black text-primary dark:text-zinc-100 line-clamp-1">{item.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.color && <span className="text-[9px] font-black bg-accent dark:bg-zinc-800 text-primary/60 dark:text-zinc-400 px-2 py-0.5 rounded-lg">اللون: {item.color}</span>}
                      {item.size && <span className="text-[9px] font-black bg-accent dark:bg-zinc-800 text-primary/60 dark:text-zinc-400 px-2 py-0.5 rounded-lg">القياس: {item.size}</span>}
                      <span className="text-[9px] font-black bg-primary/5 text-primary dark:text-zinc-100 px-2 py-0.5 rounded-lg">الكمية: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-md font-black text-secondary">{item.price?.toLocaleString()}</span>
                    <span className="text-[8px] font-bold text-secondary/60 uppercase">د.ع</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-border/50 dark:border-zinc-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-border/50 dark:border-zinc-800 pb-4">
            <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
               <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-primary dark:text-zinc-100">معلومات التوصيل</h3>
          </div>
          
          <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary/30 dark:text-zinc-500 uppercase">المستلم</span>
                  <span className="text-sm font-black text-primary dark:text-zinc-100">{order.customerName}</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary/30 dark:text-zinc-500 uppercase">الهاتف</span>
                  <span className="text-sm font-black text-primary dark:text-zinc-100 dir-ltr">{order.customerPhone}</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary/30 dark:text-zinc-500 uppercase">المحافظة</span>
                  <span className="text-sm font-black text-primary dark:text-zinc-100">{order.governorate}</span>
               </div>
               <div className="space-y-1">
                  <span className="text-[10px] font-black text-primary/30 dark:text-zinc-500 uppercase">العنوان التفصيلي</span>
                  <p className="text-xs font-bold text-primary/60 dark:text-zinc-400 leading-relaxed">
                    {order.shippingAddress?.area} - {order.shippingAddress?.street}
                  </p>
               </div>
               {order.shippingAddress?.nearestLandmark && (
                 <div className="bg-accent/50 dark:bg-zinc-800/50 p-3 rounded-xl border border-primary/5 dark:border-zinc-700 flex gap-3">
                    <Info className="h-4 w-4 text-secondary flex-shrink-0" />
                    <p className="text-[10px] font-bold text-primary/60 dark:text-zinc-400">نقطة دالة: {order.shippingAddress.nearestLandmark}</p>
                 </div>
               )}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="bg-primary dark:bg-zinc-900 text-white p-10 rounded-[3.5rem] shadow-2xl shadow-primary/20 space-y-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full -ml-12 -mb-12 blur-2xl" />
           
           <h3 className="text-lg font-black border-b border-white/10 pb-4 flex items-center gap-3 relative z-10">
              <Info className="h-5 w-5 text-secondary" /> ملخص الفاتورة
           </h3>
           
           <div className="space-y-4 relative z-10">
              <div className="flex justify-between text-xs font-bold text-white/40">
                <span>المجموع الفرعي</span>
                <span>{order.totals?.subtotal?.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white/40">
                <span>أجور التوصيل للمحافظة</span>
                <span>{order.totals?.shipping?.toLocaleString()} د.ع</span>
              </div>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-xl font-black">الإجمالي الكلي</span>
                <div className="text-right">
                   <span className="text-2xl font-black text-secondary leading-none">{order.totals?.total?.toLocaleString()}</span>
                   <span className="text-[10px] block font-black text-secondary/60 -mt-1">دينار عراقي</span>
                </div>
              </div>
           </div>
           
           <div className="pt-6 relative z-10">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                 <Truck className="h-5 w-5 text-secondary" />
                 <p className="text-[10px] font-bold leading-tight opacity-90">يتم الدفع نقداً عند استلام الشحنة وتفحصها.</p>
              </div>
           </div>
        </div>
      </main>

      {/* WhatsApp Inquiry Fixed */}
      <div className="fixed bottom-24 left-0 right-0 p-4 z-40 max-w-lg mx-auto md:hidden">
         <Button 
          onClick={() => window.open(`https://wa.me/9647858833838?text=أود الاستفسار عن طلبي رقم ${order.orderNumber}`, '_blank')}
          className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black shadow-lg transition-all gap-2"
         >
           <MessageCircle className="h-5 w-5" />
           استفسار عن هذه الطلبية
         </Button>
      </div>

      <BottomNav />
    </div>
  );
}
