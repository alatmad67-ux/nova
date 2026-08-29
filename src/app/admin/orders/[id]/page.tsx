
"use client";

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, updateDoc, collection, query } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  Calendar,
  CreditCard,
  History,
  Save,
  Printer,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  "جديد", "تم التأكيد", "قيد التجهيز", "جاهز للشحن", "مع شركة التوصيل", "تم التسليم", "ملغي", "مرتجع"
];

const SHIPPING_STATUS_OPTIONS = [
  "لم يتم الشحن", "جاهز للشحن", "تم تسليمه لشركة التوصيل", "قيد التوصيل", "تم التسليم", "فشل التسليم", "مرتجع"
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const orderRef = useMemo(() => id ? doc(db, 'orders', id as string) : null, [db, id]);
  const { data: order, loading } = useDoc(orderRef);

  const companiesQuery = useMemo(() => query(collection(db, 'delivery-companies')), [db]);
  const { data: companies } = useCollection(companiesQuery);

  const [isSaving, setIsSaving] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    companyId: '',
    trackingNumber: '',
    status: 'لم يتم الشحن'
  });

  // Sync state when order data loads
  useMemo(() => {
    if (order?.shippingInfo) {
      setShippingForm({
        companyId: order.shippingInfo.companyId || '',
        trackingNumber: order.shippingInfo.trackingNumber || '',
        status: order.shippingInfo.status || 'لم يتم الشحن'
      });
    }
  }, [order]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!orderRef) return;
    try {
      await updateDoc(orderRef, { status: newStatus });
      toast({ title: "تم التحديث", description: `حالة الطلب الآن: ${newStatus}` });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث حالة الطلب" });
    }
  };

  const handleSaveShipping = async () => {
    if (!orderRef) return;
    setIsSaving(true);
    try {
      const selectedCompany = companies?.find(c => c.id === shippingForm.companyId);
      
      await updateDoc(orderRef, {
        shippingInfo: {
          ...shippingForm,
          companyName: selectedCompany?.name || 'غير محدد'
        }
      });
      toast({ title: "تم الحفظ", description: "تم تحديث معلومات الشحن بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ معلومات الشحن" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري تحميل تفاصيل الشحنة...</div>;
  if (!order) return <div className="min-h-screen bg-black flex items-center justify-center">الطلب غير موجود</div>;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronRight className="h-6 w-6 rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-xs font-black tracking-widest text-primary uppercase">الطلب #{order.orderNumber}</span>
              </div>
              <h1 className="text-3xl font-black gold-text">تفاصيل الطلبية</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-white/10 h-12 gap-2 rounded-xl bg-white/5 font-black">
              <Printer className="h-4 w-4" />
              طباعة القائمة
            </Button>
            <select 
              className="h-12 px-6 bg-primary text-black font-black rounded-xl border-none outline-none appearance-none cursor-pointer"
              value={order.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="nova-card p-10 celestial-glow">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                محتويات الحقيبة
              </h3>
              <div className="space-y-6">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="h-20 w-16 bg-white/10 rounded-xl overflow-hidden flex-shrink-0 relative">
                      {/* Note: In a real app we'd fetch the product image from Firestore if not in order */}
                      <div className="absolute inset-0 flex items-center justify-center text-white/20">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-white">{item.name}</h4>
                      <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">
                        {item.color} / {item.size} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-primary">{(item.price * item.quantity).toLocaleString()} د.ع</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
                <div className="flex justify-between text-white/40 font-bold">
                  <span>المجموع الفرعي</span>
                  <span>{order.totals.subtotal.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between text-white/40 font-bold">
                  <span>أجور التوصيل</span>
                  <span>{order.totals.shipping.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-white pt-4">
                  <span>الإجمالي النهائي</span>
                  <span className="gold-text">{order.totals.total.toLocaleString()} د.ع</span>
                </div>
              </div>
            </div>

            {/* Shipping Management */}
            <div className="nova-card p-10 border-primary/20">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                إدارة الشحن والتوصيل
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-white/40 uppercase tracking-widest">شركة التوصيل</Label>
                  <select 
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    value={shippingForm.companyId}
                    onChange={(e) => setShippingForm({...shippingForm, companyId: e.target.value})}
                  >
                    <option value="" className="bg-slate-900">اختر الشركة</option>
                    {companies?.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-white/40 uppercase tracking-widest">رقم التتبع (Tracking #)</Label>
                  <Input 
                    placeholder="أدخلي رقم الوصل أو التتبع"
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-bold dir-ltr"
                    value={shippingForm.trackingNumber}
                    onChange={(e) => setShippingForm({...shippingForm, trackingNumber: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-white/40 uppercase tracking-widest">حالة الشحنة</Label>
                  <select 
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    value={shippingForm.status}
                    onChange={(e) => setShippingForm({...shippingForm, status: e.target.value})}
                  >
                    {SHIPPING_STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button 
                    className="w-full h-12 bg-primary text-black font-black rounded-xl gap-2 hover:scale-105 transition-all"
                    onClick={handleSaveShipping}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4" />
                    تحديث الشحن
                  </Button>
                </div>
              </div>

              {shippingForm.trackingNumber && shippingForm.companyId && (
                <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-white/80">تتبع الطلب مفعل عبر شركة {order.shippingInfo?.companyName}</span>
                  </div>
                  <button className="text-primary hover:underline flex items-center gap-1 text-xs font-black">
                    رابط التتبع
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-8">
            <div className="nova-card p-10">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-white">
                <User className="h-5 w-5 text-primary" />
                معلومات الزبونة
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">الاسم</p>
                    <p className="font-black text-lg">{order.customer.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">الهاتف</p>
                    <p className="font-black text-lg dir-ltr">{order.customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">العنوان</p>
                    <p className="font-bold text-white/80 leading-relaxed">
                      {order.customer.province} - {order.customer.region}<br />
                      {order.customer.address}<br />
                      <span className="text-xs text-primary">نقطة دالة: {order.customer.landmark || 'غير محددة'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="nova-card p-10 bg-primary/5 border-primary/20">
              <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                الدفع والتحصيل
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">طريقة الدفع</span>
                  <Badge variant="outline" className="border-primary/20 text-primary font-black">عند الاستلام</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">تاريخ الطلب</span>
                  <span className="text-xs font-bold text-white/60">
                    {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'PPP', { locale: ar }) : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ImageIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}
