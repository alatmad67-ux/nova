
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, updateDoc, collection, query } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronRight, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  Calendar,
  CreditCard,
  Save,
  Printer,
  Image as ImageIcon,
  MessageCircle,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Image from 'next/image';

const STATUS_OPTIONS = [
  "جديد", "تم التأكيد", "قيد التجهيز", "جاهز للشحن", "مع شركة التوصيل", "تم التسليم", "ملغي", "مرتجع"
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  
  const orderRef = useMemo(() => (db && id) ? doc(db, 'orders', id as string) : null, [db, id]);
  const { data: order, loading } = useDoc(orderRef);

  const [isSaving, setIsSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    if (order) setCurrentStatus(order.status);
  }, [order]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!orderRef) return;
    setIsSaving(true);
    try {
      await updateDoc(orderRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setCurrentStatus(newStatus);
      toast({ title: "تم تحديث الحالة ✨", description: `حالة الطلب الآن هي: ${newStatus}` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث الحالة في قاعدة البيانات" });
    } finally {
      setIsSaving(false);
    }
  };

  const openWhatsApp = () => {
    if (!order) return;
    const phone = order.customerPhone.replace(/\D/g, '');
    const message = `مرحباً ${order.customerName}، نحن من متجر NOVA. بخصوص طلبكِ رقم #${order.orderNumber}...`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary font-black animate-pulse">
      <Clock className="h-10 w-10 mb-4" />
      جاري جلب تفاصيل طلبية NOVA...
    </div>
  );
  
  if (!order) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black">الطلب غير موجود</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic" dir="rtl">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <button onClick={() => router.back()} className="h-14 w-14 rounded-2xl bg-accent border border-border flex items-center justify-center hover:bg-white transition-all text-primary/40 hover:text-primary shadow-sm">
                <ChevronRight className="h-6 w-6" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-xs font-black tracking-widest text-primary uppercase">الطلب #{order.orderNumber}</span>
                </div>
                <h1 className="text-3xl font-black text-primary">تفاصيل الطلبية</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button onClick={openWhatsApp} variant="outline" className="border-green-100 h-12 gap-2 rounded-xl bg-green-50 font-black text-green-600 hover:bg-green-100 shadow-sm transition-all">
                <MessageCircle className="h-5 w-5" />
                تواصل مع الزبونة
              </Button>
              <div className="relative">
                <select 
                  className="h-12 px-6 pr-10 bg-primary text-white font-black rounded-xl border-none outline-none appearance-none cursor-pointer shadow-lg shadow-primary/20"
                  value={currentStatus}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={isSaving}
                >
                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="text-black">{opt}</option>)}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="h-4 w-4 rotate-90 text-white/50" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items Table */}
            <div className="lg:col-span-2 space-y-8">
              <div className="nova-card p-10 bg-white border border-border shadow-premium">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-primary border-b border-border pb-4">
                  <Package className="h-5 w-5 text-secondary" />
                  محتويات الطلبية
                </h3>
                <div className="space-y-6">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-6 p-6 bg-accent/30 rounded-2xl border border-border/50 group hover:border-primary/20 transition-all">
                      <div className="h-24 w-20 bg-white rounded-xl overflow-hidden flex-shrink-0 relative border border-border/30">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-primary/10">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-primary text-lg">{item.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                           <Badge variant="outline" className="text-[10px] font-black border-primary/10 text-primary/60">اللون: {item.color}</Badge>
                           <Badge variant="outline" className="text-[10px] font-black border-primary/10 text-primary/60">القياس: {item.size}</Badge>
                           <Badge variant="outline" className="text-[10px] font-black border-primary/10 text-primary/60">الكمية: {item.quantity}</Badge>
                        </div>
                        <p className="text-[10px] text-primary/20 font-bold mt-2 uppercase tracking-tighter">SKU: {item.sku}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-black text-secondary text-lg">{(item.price * item.quantity).toLocaleString()} د.ع</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 pt-10 border-t border-border space-y-4">
                  <div className="flex justify-between text-primary/40 font-black text-sm">
                    <span>المجموع الفرعي</span>
                    <span>{order.totals?.subtotal?.toLocaleString()} د.ع</span>
                  </div>
                  <div className="flex justify-between text-primary/40 font-black text-sm">
                    <span>أجور التوصيل ({order.governorate})</span>
                    <span>{order.totals?.shipping?.toLocaleString()} د.ع</span>
                  </div>
                  <div className="h-px bg-border my-6" />
                  <div className="flex justify-between text-2xl font-black text-primary">
                    <span>الإجمالي النهائي</span>
                    <span className="text-secondary">{order.totals?.total?.toLocaleString()} د.ع</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="space-y-8">
              <div className="nova-card p-10 bg-white border border-border shadow-sm">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-primary border-b border-border pb-4">
                  <User className="h-5 w-5 text-secondary" />
                  بيانات الزبونة
                </h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0 text-primary/40">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest mb-1">الاسم الكامل</p>
                      <p className="font-black text-lg text-primary">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0 text-primary/40">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest mb-1">رقم الهاتف</p>
                      <p className="font-black text-lg text-primary dir-ltr text-right">{order.customerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0 text-primary/40">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest mb-1">عنوان التوصيل</p>
                      <p className="font-bold text-primary/80 leading-relaxed text-sm">
                        {order.shippingAddress?.governorate} - {order.shippingAddress?.area}<br />
                        {order.shippingAddress?.street}<br />
                        <span className="text-secondary font-black">نقطة دالة: {order.shippingAddress?.nearestLandmark || 'غير محددة'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nova-card p-10 bg-primary/5 border border-primary/10">
                <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-primary">
                  <CreditCard className="h-5 w-5 text-primary" />
                  حالة الدفع
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-primary/40 uppercase tracking-widest">طريقة الدفع</span>
                    <Badge variant="outline" className="border-primary/20 text-primary font-black bg-white">عند الاستلام</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-primary/40 uppercase tracking-widest">تاريخ الطلب</span>
                    <span className="text-xs font-bold text-primary/60">
                      {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'PPPP', { locale: ar }) : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
