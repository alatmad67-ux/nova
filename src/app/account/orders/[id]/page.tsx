
"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  ChevronLeft, 
  Package, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock,
  HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { BottomNav } from '@/components/layout/BottomNav';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const orderRef = useMemo(() => (db && id) ? doc(db, 'orders', id as string) : null, [db, id]);
  const { data: order, loading } = useDoc(orderRef);

  const steps = [
    { label: 'تم استلام الطلب', status: ['جديد', 'تم التأكيد', 'قيد التجهيز', 'جاهز للشحن', 'مع شركة التوصيل', 'تم التسليم'] },
    { label: 'قيد التجهيز', status: ['قيد التجهيز', 'جاهز للشحن', 'مع شركة التوصيل', 'تم التسليم'] },
    { label: 'في الطريق', status: ['مع شركة التوصيل', 'تم التسليم'] },
    { label: 'تم التسليم', status: ['تم التسليم'] },
  ];

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center animate-pulse font-black text-primary">جاري جلب تفاصيل الطلبية...</div>;
  if (!order) return <div className="min-h-screen bg-background flex items-center justify-center font-black">الطلب غير موجود</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32" dir="rtl">
      <header className="h-20 flex items-center px-6 justify-between bg-white sticky top-0 z-40 border-b border-border/50">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">تفاصيل الطلب</h1>
        <button className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
          <HelpCircle className="h-5 w-5" />
        </button>
      </header>

      <main className="container mx-auto px-5 py-8 space-y-8 max-w-lg">
        {/* Order Header Info */}
        <div className="text-center">
          <p className="text-xs font-black text-primary/30 uppercase tracking-widest mb-1">رقم الطلبية</p>
          <h2 className="text-2xl font-black text-primary">#{order.orderNumber}</h2>
          <p className="text-xs text-primary/40 font-bold mt-2">
            {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'PPPP', { locale: ar }) : ''}
          </p>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-border/50">
          <div className="flex justify-between items-start">
            {steps.map((step, idx) => {
              const isCompleted = step.status.includes(order.status);
              return (
                <div key={idx} className="flex flex-col items-center gap-3 relative flex-1">
                  {idx < steps.length - 1 && (
                    <div className={cn("absolute top-5 -left-1/2 w-full h-0.5", isCompleted ? "bg-primary/20" : "bg-accent")} />
                  )}
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center z-10 transition-all",
                    isCompleted ? "bg-primary text-white shadow-lg" : "bg-accent text-primary/20"
                  )}>
                    {idx === 0 ? <Clock className="h-4 w-4" /> : 
                     idx === 1 ? <Package className="h-4 w-4" /> : 
                     idx === 2 ? <Truck className="h-4 w-4" /> : 
                     <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <span className={cn("text-[9px] font-black text-center", isCompleted ? "text-primary" : "text-primary/20")}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-primary pr-2">المنتجات</h3>
          <div className="space-y-3">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="bg-white rounded-3xl p-4 flex gap-4 border border-border/30">
                <div className="h-20 w-16 bg-accent rounded-2xl overflow-hidden relative">
                   <div className="absolute inset-0 flex items-center justify-center text-primary/10"><Package className="h-6 w-6" /></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-primary line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] text-primary/40 font-bold mt-1">
                    {item.color} / {item.size} × {item.quantity}
                  </p>
                  <p className="text-sm font-black text-primary mt-2">{item.price?.toLocaleString()} د.ع</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-5 w-5 text-secondary" />
            <h3 className="text-sm font-black text-primary">عنوان التوصيل</h3>
          </div>
          <div className="text-xs font-bold text-primary/60 space-y-1">
            <p className="font-black text-primary">{order.shippingAddress?.label || 'العنوان'}</p>
            <p>{order.shippingAddress?.governorate} - {order.shippingAddress?.area}</p>
            <p>{order.shippingAddress?.street}</p>
            <p className="text-secondary text-[10px]">نقطة دالة: {order.shippingAddress?.nearestLandmark || 'غير محددة'}</p>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-primary/5 rounded-[2.5rem] p-6 border border-primary/10 space-y-4">
          <div className="flex justify-between text-xs font-bold text-primary/40">
            <span>المجموع الفرعي</span>
            <span>{order.totals?.subtotal?.toLocaleString()} د.ع</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-primary/40">
            <span>أجور التوصيل</span>
            <span>{order.totals?.shipping?.toLocaleString()} د.ع</span>
          </div>
          <div className="h-px bg-primary/10" />
          <div className="flex justify-between text-lg font-black text-primary">
            <span>الإجمالي</span>
            <span className="text-secondary">{order.totals?.total?.toLocaleString()} د.ع</span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
