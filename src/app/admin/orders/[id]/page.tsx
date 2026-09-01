
"use client";

import React, { useMemo, useState } from 'react';
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
  History,
  Save,
  Printer,
  ExternalLink,
  Image as ImageIcon
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

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black animate-pulse">جاري تحميل تفاصيل الشحنة...</div>;
  if (!order) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black">الطلب غير موجود</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <button onClick={() => router.back()} className="h-14 w-14 rounded-2xl bg-accent border border-border flex items-center justify-center hover:bg-white transition-all text-primary/40 hover:text-primary shadow-sm">
                <ChevronRight className="h-6 w-6 rotate-180" />
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
              <Button variant="outline" className="border-border h-12 gap-2 rounded-xl bg-white font-black text-primary shadow-sm">
                <Printer className="h-4 w-4" />
                طباعة القائمة
              </Button>
              <select 
                className="h-12 px-6 bg-primary text-white font-black rounded-xl border-none outline-none appearance-none cursor-pointer shadow-lg shadow-primary/20"
                value={order.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="text-black">{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="nova-card p-10 bg-white">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-primary">
                  <Package className="h-5 w-5 text-primary" />
                  محتويات الحقيبة
                </h3>
                <div className="space-y-6">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-6 p-6 bg-accent/30 rounded-2xl border border-border">
                      <div className="h-20 w-16 bg-accent rounded-xl overflow-hidden flex-shrink-0 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-primary">{item.name}</h4>
                        <p className="text-xs text-primary/40 mt-1 uppercase tracking-widest font-bold">
                          {item.color} / {item.size} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-black text-primary">{(item.price * item.quantity).toLocaleString()} د.ع</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 pt-10 border-t border-border space-y-4">
                  <div className="flex justify-between text-primary/40 font-black">
                    <span>المجموع الفرعي</span>
                    <span>{order.totals.subtotal.toLocaleString()} د.ع</span>
                  </div>
                  <div className="flex justify-between text-primary/40 font-black">
                    <span>أجور التوصيل</span>
                    <span>{order.totals.shipping.toLocaleString()} د.ع</span>
                  </div>
                  <div className="h-px bg-border my-6" />
                  <div className="flex justify-between text-2xl font-black text-primary">
                    <span>الإجمالي النهائي</span>
                    <span className="text-secondary">{order.totals.total.toLocaleString()} د.ع</span>
                  </div>
                </div>
              </div>

              <div className="nova-card p-10 border-primary/20 bg-white shadow-premium">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-primary">
                  <Truck className="h-5 w-5 text-primary" />
                  إدارة الشحن والتوصيل
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">شركة التوصيل</Label>
                    <select 
                      className="w-full h-12 px-4 bg-accent/30 border border-border rounded-xl text-primary font-bold outline-none"
                      value={shippingForm.companyId}
                      onChange={(e) => setShippingForm({...shippingForm, companyId: e.target.value})}
                    >
                      <option value="">اختر الشركة</option>
                      {companies?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">رقم التتبع (Tracking #)</Label>
                    <Input 
                      placeholder="أدخلي رقم الوصل أو التتبع"
                      className="h-12 bg-accent/30 border-border rounded-xl font-bold text-primary dir-ltr"
                      value={shippingForm.trackingNumber}
                      onChange={(e) => setShippingForm({...shippingForm, trackingNumber: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">حالة الشحنة</Label>
                    <select 
                      className="w-full h-12 px-4 bg-accent/30 border border-border rounded-xl text-primary font-bold outline-none"
                      value={shippingForm.status}
                      onChange={(e) => setShippingForm({...shippingForm, status: e.target.value})}
                    >
                      {SHIPPING_STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      className="w-full h-12 bg-primary text-white font-black rounded-xl gap-2 hover:scale-[1.02] transition-all"
                      onClick={handleSaveShipping}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                      تحديث الشحن
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="nova-card p-10 bg-white">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-primary">
                  <User className="h-5 w-5 text-primary" />
                  معلومات الزبونة
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0 text-primary/40">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-primary/40 font-black uppercase tracking-widest mb-1">الاسم</p>
                      <p className="font-black text-lg text-primary">{order.customer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0 text-primary/40">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-primary/40 font-black uppercase tracking-widest mb-1">الهاتف</p>
                      <p className="font-black text-lg text-primary dir-ltr">{order.customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0 text-primary/40">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-primary/40 font-black uppercase tracking-widest mb-1">العنوان</p>
                      <p className="font-bold text-primary/80 leading-relaxed">
                        {order.customer.province} - {order.customer.region}<br />
                        {order.customer.address}<br />
                        <span className="text-xs text-secondary font-black">نقطة دالة: {order.customer.landmark || 'غير محددة'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nova-card p-10 bg-primary/5 border-primary/20">
                <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-primary">
                  <CreditCard className="h-5 w-5 text-primary" />
                  الدفع والتحصيل
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-primary/40 uppercase tracking-widest">طريقة الدفع</span>
                    <Badge variant="outline" className="border-primary/20 text-primary font-black bg-white">عند الاستلام</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-primary/40 uppercase tracking-widest">تاريخ الطلب</span>
                    <span className="text-xs font-bold text-primary/60">
                      {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'PPP', { locale: ar }) : '-'}
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
