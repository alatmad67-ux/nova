
"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, 
  MapPin, 
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Truck,
  CreditCard
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc, collection, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { STORE_ID, IRAQI_GOVERNORATES } from '@/lib/constants';
import Image from 'next/image';

function FastCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();

  const productId = searchParams.get('productId');
  const color = searchParams.get('color');
  const size = searchParams.get('size');
  const qty = parseInt(searchParams.get('qty') || '1');

  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [deliveryPrice, setDeliveryPrice] = useState(5000);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    governorate: 'بغداد',
    area: '',
    street: '',
    building: '',
    floor: '',
    landmark: '',
    notes: ''
  });

  // جلب بيانات العميل المسجل إذا وجد
  const profileRef = useMemo(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.displayName || prev.name,
        phone: profile.phoneNumber || prev.phone
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (db && productId) {
      getDoc(doc(db, 'products', productId)).then(snap => {
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
        setLoadingProduct(false);
      });
    }
  }, [db, productId]);

  useEffect(() => {
    if (db && formData.governorate) {
      getDoc(doc(db, 'shipping-rates', `${STORE_ID}_${formData.governorate}`)).then(snap => {
        if (snap.exists() && snap.data().isActive) setDeliveryPrice(snap.data().price);
      });
    }
  }, [db, formData.governorate]);

  const subtotal = (product?.price || 0) * qty;
  const total = subtotal + deliveryPrice;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !product) return;

    if (!formData.name || !formData.phone || !formData.area || !formData.street) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء جميع الحقول المطلوبة للتوصيل" });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
      const newOrderRef = doc(collection(db, 'orders'));
      
      const orderData = {
        orderNumber,
        customerId: user?.uid || null,
        isGuest: !user,
        customerName: formData.name,
        customerPhone: formData.phone,
        governorate: formData.governorate,
        shippingAddress: {
          ...formData,
          fullAddress: `${formData.governorate}, ${formData.area}, ${formData.street}`
        },
        items: [{
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          color,
          size,
          image: product.images?.[0]
        }],
        totals: { subtotal, shipping: deliveryPrice, total },
        status: 'جديد',
        storeId: STORE_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(newOrderRef, orderData);
      setOrderResult({ id: newOrderRef.id, number: orderNumber, total, governorate: formData.governorate });
      toast({ title: "تم تثبيت طلبكِ ✨" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال الطلب، يرجى المحاولة لاحقاً" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProduct) return <div className="min-h-screen bg-background flex items-center justify-center font-black animate-pulse">جاري تجهيز بوابة الشراء...</div>;
  if (!product) return <div className="min-h-screen bg-background flex items-center justify-center font-black">المنتج غير متوفر</div>;

  if (orderResult) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-arabic p-6 items-center justify-center">
        <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-premium text-center">
          <div className="h-20 w-20 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle2 className="h-10 w-10" /></div>
          <h1 className="text-3xl font-black text-primary mb-4">تم استلام طلبكِ بنجاح ✦</h1>
          <p className="text-primary/40 font-bold mb-10">رقم الطلبية <span className="text-primary">#{orderResult.number}</span> بقيمة <span className="text-secondary">{orderResult.total.toLocaleString()} د.ع</span></p>
          <div className="space-y-4">
            <Button onClick={() => window.open(`https://wa.me/9647858833838?text=أود تأكيد طلبي السريع #${orderResult.number}`, '_blank')} className="w-full h-16 rounded-2xl bg-green-500 text-white font-black shadow-xl gap-3"><MessageCircle className="h-6 w-6" /> تأكيد عبر واتساب</Button>
            <Button onClick={() => router.push('/')} variant="ghost" className="w-full h-14 rounded-xl text-primary/40 font-black">العودة للرئيسية</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32">
      <header className="h-20 flex items-center px-6 justify-between bg-white border-b border-border/30 sticky top-0 z-50">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary"><ChevronRight className="h-6 w-6" /></button>
        <h1 className="text-xl font-black text-primary uppercase tracking-widest">الشراء السريع</h1>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-5 py-8 max-w-lg space-y-10">
        {/* Product Snapshot */}
        <section className="bg-white p-5 rounded-[2rem] border border-primary/5 shadow-sm flex gap-5 items-center">
          <div className="h-24 w-20 relative rounded-2xl overflow-hidden bg-accent flex-shrink-0 border border-border/20">
            <Image src={product.images?.[0]} alt={product.name} fill className="object-cover" />
          </div>
          <div className="flex-1">
             <h4 className="font-black text-primary text-sm line-clamp-1">{product.name}</h4>
             <div className="flex gap-2 mt-1.5">
                <Badge variant="outline" className="text-[9px] font-black">{color}</Badge>
                <Badge variant="outline" className="text-[9px] font-black">{size}</Badge>
                <Badge className="bg-primary/5 text-primary text-[9px] font-black border-none">الكمية: {qty}</Badge>
             </div>
             <p className="text-secondary font-black mt-2 text-md">{subtotal.toLocaleString()} د.ع</p>
          </div>
        </section>

        {/* Guest Form */}
        <form onSubmit={handlePlaceOrder} className="space-y-8">
          <section className="space-y-6">
            <h3 className="text-lg font-black text-primary flex items-center gap-3"><MapPin className="h-5 w-5 text-secondary" /> معلومات التوصيل</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pr-2">الاسم الكامل *</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="أدخلي اسمكِ الثلاثي" className="h-14 rounded-2xl bg-accent/30 border-none font-bold text-primary" required />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pr-2">رقم الهاتف *</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="07xxxxxxxx" className="h-14 rounded-2xl bg-accent/30 border-none font-bold text-primary dir-ltr text-right" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pr-2">المحافظة *</Label>
                  <select className="w-full h-14 px-4 bg-accent/30 border-none rounded-2xl font-bold text-primary outline-none appearance-none" value={formData.governorate} onChange={e => setFormData({...formData, governorate: e.target.value})}>
                    {IRAQI_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pr-2">المنطقة *</Label>
                  <Input value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} placeholder="اسم المنطقة" className="h-14 rounded-2xl bg-accent/30 border-none font-bold text-primary" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pr-2">العنوان التفصيلي (الشارع / الزقاق) *</Label>
                <Input value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} placeholder="رقم الدار، اسم الشارع..." className="h-14 rounded-2xl bg-accent/30 border-none font-bold text-primary" required />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pr-2">أقرب نقطة دالة (اختياري)</Label>
                <Input value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} placeholder="مثال: قرب صيدلية النور" className="h-14 rounded-2xl bg-accent/30 border-none font-bold text-primary" />
              </div>
            </div>
          </section>

          {/* Totals Summary */}
          <div className="bg-primary text-white p-10 rounded-[3.5rem] shadow-2xl shadow-primary/20 space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
             <h3 className="text-xl font-black border-b border-white/10 pb-4">ملخص الطلبية السريعة</h3>
             <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold text-white/40"><span>قيمة القطعة</span><span>{subtotal.toLocaleString()} د.ع</span></div>
                <div className="flex justify-between text-sm font-bold text-white/40"><span>أجور التوصيل ({formData.governorate})</span><span>{deliveryPrice.toLocaleString()} د.ع</span></div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between text-2xl font-black"><span>الإجمالي النهائي</span><span className="text-secondary">{total.toLocaleString()} د.ع</span></div>
             </div>
             <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/5"><Truck className="h-5 w-5 text-secondary" /><p className="text-[10px] font-bold">يتم الدفع نقداً عند استلام القطعة وفحصها.</p></div>
             <Button type="submit" disabled={isSubmitting} className="w-full mt-6 h-16 rounded-[2rem] bg-white text-primary text-xl font-black shadow-xl">{isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "تأكيد الشراء الآن"}</Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function FastCheckoutPage() {
  return <Suspense><FastCheckoutContent /></Suspense>;
}
