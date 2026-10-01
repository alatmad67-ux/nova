
"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageCircle,
  MapPin,
  Truck,
  Smartphone,
  User,
  Info,
  Zap,
  Tag
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc, collection, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { STORE_ID, IRAQI_GOVERNORATES } from '@/lib/constants';
import Image from 'next/image';
import { cn } from "@/lib/utils";

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
    landmark: '',
    notes: ''
  });

  // جلب بيانات العميل المسجل إذا وجد لتسهيل التعبئة
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
      const rateId = `${STORE_ID}_${formData.governorate}`;
      getDoc(doc(db, 'shipping-rates', rateId)).then(snap => {
        if (snap.exists() && snap.data().isActive) {
          setDeliveryPrice(snap.data().price);
        } else {
          setDeliveryPrice(5000); // سعر افتراضي
        }
      });
    }
  }, [db, formData.governorate]);

  const subtotal = (product?.price || 0) * qty;
  const total = subtotal + deliveryPrice;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !product) return;

    if (!formData.name.trim() || !formData.phone.trim() || !formData.area.trim() || !formData.street.trim()) {
      toast({ 
        variant: "destructive", 
        title: "بيانات ناقصة", 
        description: "يرجى ملء كافة الحقول المطلوبة (الاسم، الهاتف، المنطقة، الشارع)" 
      });
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
          area: formData.area,
          street: formData.street,
          landmark: formData.landmark,
          fullAddress: `${formData.governorate}, ${formData.area}, ${formData.street}`
        },
        items: [{
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          color: color || 'عام',
          size: size || 'واحد',
          image: product.images?.[0] || ''
        }],
        totals: {
          subtotal,
          shipping: deliveryPrice,
          total
        },
        status: 'جديد',
        storeId: STORE_ID,
        notes: formData.notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(newOrderRef, orderData);

      // إشعار للإدارة (اختياري، يمكن تفعيله لاحقاً)
      
      setOrderResult({ 
        id: newOrderRef.id, 
        number: orderNumber, 
        total, 
        governorate: formData.governorate,
        customerName: formData.name
      });
      toast({ title: "تم تثبيت طلبكِ بنجاح ✨" });
    } catch (error) {
      console.error("Fast Checkout Error:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال الطلب، يرجى المحاولة لاحقاً" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProduct) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-black animate-pulse text-primary">
      <Zap className="h-10 w-10 mb-4 animate-bounce text-secondary" />
      جاري تجهيز بوابة الشراء السريع...
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-black">
      <Info className="h-12 w-12 text-primary/20 mb-4" />
      <h2 className="text-xl text-primary">عذراً، المنتج غير متوفر حالياً</h2>
      <Button onClick={() => router.push('/')} className="mt-6 rounded-full px-8">العودة للمتجر</Button>
    </div>
  );

  if (orderResult) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-arabic p-6 items-center justify-center" dir="rtl">
        <div className="w-full max-w-md bg-white p-10 rounded-[3.5rem] shadow-premium text-center border border-border/50">
          <div className="h-24 w-24 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-8 shadow-inner border border-green-100">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-black text-primary mb-4 leading-tight">تم استلام طلبكِ بنجاح ✦</h1>
          <p className="text-primary/40 font-bold mb-8 text-sm px-4">
            شكراً لكِ <span className="text-primary">{orderResult.customerName}</span>. 
            رقم الطلبية هو <span className="text-secondary">#{orderResult.number}</span> بقيمة إجمالية <span className="text-secondary">{orderResult.total.toLocaleString()} د.ع</span>.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => window.open(`https://wa.me/9647858833838?text=أود تأكيد طلبي السريع رقم #${orderResult.number} باسم ${orderResult.customerName}`, '_blank')} 
              className="w-full h-16 rounded-[2rem] bg-green-500 hover:bg-green-600 text-white font-black shadow-xl gap-3 transition-all"
            >
              <MessageCircle className="h-6 w-6" /> 
              تأكيد عبر واتساب
            </Button>
            <Button onClick={() => router.push('/')} variant="ghost" className="w-full h-14 rounded-2xl text-primary/40 font-black hover:bg-accent">
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] font-arabic pb-32" dir="rtl">
      {/* Header */}
      <header className="h-20 flex items-center px-6 justify-between bg-white/80 backdrop-blur-md border-b border-border/30 sticky top-0 z-50">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary shadow-sm hover:bg-white transition-all">
          <ChevronRight className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-black text-primary uppercase tracking-widest">الشراء السريع</h1>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-5 py-8 max-w-lg space-y-8">
        {/* Product Snapshot */}
        <section className="bg-white p-6 rounded-[2.5rem] border border-primary/5 shadow-sm flex gap-6 items-center">
          <div className="h-28 w-24 relative rounded-2xl overflow-hidden bg-accent flex-shrink-0 border border-border/20 shadow-inner">
            <Image src={product.images?.[0] || 'https://picsum.photos/seed/placeholder/400/600'} alt={product.name} fill className="object-contain p-2" />
          </div>
          <div className="flex-1 space-y-2">
             <div className="flex items-center gap-1.5 opacity-40">
                <Tag className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">{product.categoryName}</span>
             </div>
             <h4 className="font-black text-primary text-sm line-clamp-1">{product.name}</h4>
             <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-[9px] font-black border-primary/10 text-primary/60">اللون: {color}</Badge>
                <Badge variant="outline" className="text-[9px] font-black border-primary/10 text-primary/60">القياس: {size}</Badge>
                <Badge className="bg-primary/5 text-primary text-[9px] font-black border-none">الكمية: {qty}</Badge>
             </div>
             <p className="text-secondary font-black text-lg">{subtotal.toLocaleString()} <span className="text-[10px] opacity-60">د.ع</span></p>
          </div>
        </section>

        {/* Guest Info Form */}
        <form onSubmit={handlePlaceOrder} className="space-y-10 pb-20">
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-primary">معلومات التوصيل</h3>
            </div>
            
            <div className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary/30 uppercase tracking-widest pr-4 block">الاسم الكامل (الثلاثي) *</Label>
                <div className="relative group">
                  <User className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="أدخلي اسمكِ الثلاثي هنا" 
                    className="h-16 pr-14 rounded-[1.5rem] bg-white border-border/50 font-bold text-primary focus-visible:ring-primary/20 focus-visible:border-primary/30 shadow-sm" 
                    required 
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary/30 uppercase tracking-widest pr-4 block">رقم الهاتف للتواصل *</Label>
                <div className="relative group">
                  <Smartphone className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    placeholder="07xxxxxxxx" 
                    className="h-16 pr-14 rounded-[1.5rem] bg-white border-border/50 font-bold text-primary dir-ltr text-right focus-visible:ring-primary/20 focus-visible:border-primary/30 shadow-sm" 
                    required 
                  />
                </div>
              </div>

              {/* Governorate & Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-primary/30 uppercase tracking-widest pr-4 block">المحافظة *</Label>
                  <select 
                    className="w-full h-16 px-6 bg-white border border-border/50 rounded-[1.5rem] font-bold text-primary outline-none appearance-none focus:border-primary/30 shadow-sm" 
                    value={formData.governorate} 
                    onChange={e => setFormData({...formData, governorate: e.target.value})}
                  >
                    {IRAQI_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-primary/30 uppercase tracking-widest pr-4 block">المنطقة / القضاء *</Label>
                  <Input 
                    value={formData.area} 
                    onChange={e => setFormData({...formData, area: e.target.value})} 
                    placeholder="اسم المنطقة" 
                    className="h-16 rounded-[1.5rem] bg-white border-border/50 font-bold text-primary focus-visible:ring-primary/20 shadow-sm" 
                    required 
                  />
                </div>
              </div>

              {/* Detailed Street Address */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary/30 uppercase tracking-widest pr-4 block">العنوان التفصيلي (الشارع / الزقاق) *</Label>
                <Input 
                  value={formData.street} 
                  onChange={e => setFormData({...formData, street: e.target.value})} 
                  placeholder="رقم الدار، اسم الشارع، معلم معروف..." 
                  className="h-16 rounded-[1.5rem] bg-white border-border/50 font-bold text-primary focus-visible:ring-primary/20 shadow-sm" 
                  required 
                />
              </div>

              {/* Landmark */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary/30 uppercase tracking-widest pr-4 block">أقرب نقطة دالة (اختياري)</Label>
                <Input 
                  value={formData.landmark} 
                  onChange={e => setFormData({...formData, landmark: e.target.value})} 
                  placeholder="مثال: قرب صيدلية النور" 
                  className="h-16 rounded-[1.5rem] bg-white border-border/50 font-bold text-primary focus-visible:ring-primary/20 shadow-sm" 
                />
              </div>

              {/* Order Notes */}
              <div className="space-y-2 pt-2">
                <Label className="text-[10px] font-black text-primary/30 uppercase tracking-widest pr-4 block">ملاحظات إضافية (اختياري)</Label>
                <Textarea 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})} 
                  placeholder="أي معلومات تودين إخبارنا بها بخصوص التوصيل..." 
                  className="min-h-[100px] rounded-[1.5rem] bg-white border-border/50 font-medium text-primary p-5 focus-visible:ring-primary/20 shadow-sm" 
                />
              </div>
            </div>
          </section>

          {/* Fixed Bottom Summary */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-border/30 z-[60] shadow-2xl">
            <div className="container mx-auto max-w-lg">
              <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                
                <h3 className="text-lg font-black border-b border-white/10 pb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-secondary fill-secondary" />
                  ملخص الطلبية الملكية
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-white/40">
                    <span>قيمة القطعة</span>
                    <span>{subtotal.toLocaleString()} د.ع</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-white/40">
                    <span>أجور التوصيل ({formData.governorate})</span>
                    <span>{deliveryPrice.toLocaleString()} د.ع</span>
                  </div>
                  <div className="h-px bg-white/10 my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black tracking-wide">الإجمالي النهائي</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-secondary">{total.toLocaleString()}</span>
                      <span className="text-[10px] block font-black text-secondary/60 -mt-1 uppercase">د.ع</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/5">
                  <Truck className="h-5 w-5 text-secondary" />
                  <p className="text-[9px] font-bold leading-tight opacity-90">يتم الدفع نقداً عند استلام القطعة وفحصها.</p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full mt-4 h-16 rounded-[1.5rem] bg-white text-primary text-xl font-black shadow-xl hover:scale-[1.02] transition-all border-b-4 border-black/10"
                  onClick={handlePlaceOrder}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin ml-2" />
                      جاري تأكيد طلبكِ...
                    </>
                  ) : "تأكيد الشراء الآن ✦"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function FastCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-black animate-pulse text-primary">
        <Loader2 className="h-10 w-10 animate-spin text-secondary mb-4" />
        جاري تحميل بوابة الدفع...
      </div>
    }>
      <FastCheckoutContent />
    </Suspense>
  );
}
