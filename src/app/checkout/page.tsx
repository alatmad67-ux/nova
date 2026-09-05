
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  User, 
  Truck, 
  CreditCard,
  CheckCircle2,
  MessageCircle,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/providers/cart-provider';
import { useDoc, useFirestore } from '@/firebase';
import { doc, collection, serverTimestamp, runTransaction } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

const PROVINCES = [
  "بغداد", "البصرة", "نينوى", "أربيل", "النجف", "كربلاء", "ذي قار", "بابل", "الأنبار", "كركوك", "ديالى", "صلاح الدين", "المثنى", "القادسية", "ميسان", "واسط", "السليمانية", "دهوك"
];

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const db = useFirestore();
  const settingsRef = useMemo(() => {
    if (!db) return null;
    return doc(db, 'settings', 'general');
  }, [db]);
  const { data: settings } = useDoc(settingsRef);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ id: string, number: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    province: 'بغداد',
    region: '',
    address: '',
    landmark: '',
    notes: ''
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = settings?.deliveryFees?.[formData.province] ?? 5000;
  const total = subtotal + shippingFee;

  const formatPrice = (price: number) => price.toLocaleString() + ' د.ع';

  const handlePlaceOrder = async () => {
    if (!db || !formData.name || !formData.phone || !formData.address || !formData.region) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء جميع الحقول المطلوبة للتوصيل" });
      return;
    }

    if (cart.length === 0) return;

    setIsSubmitting(true);

    try {
      const orderNumber = `NOVA-${Math.floor(1000 + Math.random() * 9000)}`;
      
      await runTransaction(db, async (transaction) => {
        // 1. Check stock for all items
        for (const item of cart) {
          const productRef = doc(db, 'products', item.id);
          const productDoc = await transaction.get(productRef);
          
          if (!productDoc.exists()) throw new Error(`المنتج ${item.name} غير موجود`);
          
          const productData = productDoc.data();
          const variantIndex = productData.variants?.findIndex((v: any) => v.sku === item.variant.sku);
          
          if (variantIndex !== undefined && variantIndex !== -1) {
            const currentStock = productData.variants[variantIndex].stock;
            if (currentStock < item.quantity) {
              throw new Error(`عذراً، المخزون الحالي لـ ${item.name} لا يكفي`);
            }
            const newVariants = [...productData.variants];
            newVariants[variantIndex].stock -= item.quantity;
            transaction.update(productRef, { variants: newVariants });
          }
        }

        // 2. Create Order Record
        const orderData = {
          orderNumber,
          customer: formData,
          items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.variant.color,
            size: item.variant.size,
            sku: item.variant.sku
          })),
          totals: {
            subtotal,
            shipping: shippingFee,
            discount: 0,
            total
          },
          status: 'جديد',
          storeId: 'nova-official',
          createdAt: serverTimestamp()
        };

        const ordersCol = collection(db, 'orders');
        const newOrderRef = doc(ordersCol);
        transaction.set(newOrderRef, orderData);
        
        setOrderResult({ id: newOrderRef.id, number: orderNumber });
      });

      toast({ title: "تم تثبيت الطلب", description: "يرجى الضغط على زر الواتساب لإكمال التأكيد" });
    } catch (error: any) {
      console.error("Order error:", error);
      toast({ variant: "destructive", title: "فشل الطلب", description: error.message || "حدث خطأ أثناء معالجة الطلب" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    if (!orderResult || !settings?.whatsapp) return;

    const itemsText = cart.map(i => `- ${i.name} (${i.variant.color}/${i.variant.size}) × ${i.quantity}`).join('\n');

    const message = `🛍️ طلب جديد من NOVA

رقم الطلب: ${orderResult.number}

👤 العميل: ${formData.name}
📞 الهاتف: ${formData.phone}
📍 العنوان: ${formData.province} - ${formData.region}
🏠 التفاصيل: ${formData.address}
💡 نقطة دالة: ${formData.landmark || 'لا يوجد'}

🛒 المشتريات:
${itemsText}

🚚 التوصيل: ${formatPrice(shippingFee)}
💰 الإجمالي: ${formatPrice(total)}

📝 ملاحظات: ${formData.notes || 'لا يوجد'}`;

    window.open(`https://wa.me/${settings.whatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    clearCart();
  };

  if (orderResult) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-12 rounded-[4rem] bg-white border border-border shadow-premium">
            <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-black text-primary mb-4">خطوة واحدة متبقية!</h1>
            <p className="text-primary/60 mb-10 font-medium">
              رقم طلبك هو <span className="text-primary font-bold">#{orderResult.number}</span>. 
              يجب الضغط على الزر أدناه لتأكيد طلبكِ عبر الواتساب وإرسال العنوان للمندوب.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={handleWhatsAppConfirm}
                className="w-full h-16 rounded-full text-lg font-black bg-green-500 text-white hover:bg-green-600 hover:scale-105 transition-all gap-3 shadow-xl shadow-green-200"
              >
                <MessageCircle className="h-6 w-6" />
                تأكيد عبر واتساب الآن
              </Button>
              <Button asChild variant="ghost" className="w-full h-14 rounded-full text-primary/40 hover:text-primary">
                <Link href="/">العودة للمتجر</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/cart" className="text-primary/40 hover:text-primary transition-colors flex items-center gap-2 font-bold">
            السلة
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-primary">إتمام الطلب</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="text-2xl font-black text-primary mb-8 flex items-center gap-3">
                <MapPin className="h-6 w-6 text-secondary" />
                معلومات التوصيل
              </h2>
              
              <div className="nova-card p-8 md:p-12 space-y-8 border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-primary/60 font-black text-xs uppercase tracking-widest pr-2">الاسم الكامل *</Label>
                    <div className="relative group">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                      <Input 
                        placeholder="أدخلي اسمكِ بالكامل" 
                        className="h-14 pr-12 bg-accent/30 border-border rounded-2xl text-primary font-bold focus:border-primary/50"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-primary/60 font-black text-xs uppercase tracking-widest pr-2">رقم الهاتف *</Label>
                    <div className="relative group">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                      <Input 
                        placeholder="07XX XXX XXXX" 
                        className="h-14 pr-12 bg-accent/30 border-border rounded-2xl text-primary font-bold focus:border-primary/50 text-left dir-ltr"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-primary/60 font-black text-xs uppercase tracking-widest pr-2">المحافظة *</Label>
                    <select 
                      className="w-full h-14 px-4 bg-accent/30 border border-border rounded-2xl text-primary font-bold focus:border-primary/50 outline-none appearance-none cursor-pointer"
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                    >
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-primary/60 font-black text-xs uppercase tracking-widest pr-2">المنطقة / الحي *</Label>
                    <Input 
                      placeholder="اسم الحي أو المنطقة" 
                      className="h-14 bg-accent/30 border-border rounded-2xl text-primary font-bold focus:border-primary/50"
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-primary/60 font-black text-xs uppercase tracking-widest pr-2">العنوان التفصيلي *</Label>
                  <Input 
                    placeholder="رقم الدار، الزقاق، أو تفاصيل الموقع" 
                    className="h-14 bg-accent/30 border-border rounded-2xl text-primary font-bold focus:border-primary/50"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-primary/60 font-black text-xs uppercase tracking-widest pr-2">أقرب نقطة دالة</Label>
                  <Input 
                    placeholder="مدرسة، جامع، أو محل معروف" 
                    className="h-14 bg-accent/30 border-border rounded-2xl text-primary font-bold focus:border-primary/50"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-primary/60 font-black text-xs uppercase tracking-widest pr-2">ملاحظات إضافية</Label>
                  <Textarea 
                    placeholder="أي ملاحظات للمندوب أو المتجر..." 
                    className="min-h-[100px] bg-accent/30 border-border rounded-2xl text-primary font-bold focus:border-primary/50"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-primary mb-8 flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-secondary" />
                طريقة الدفع
              </h2>
              
              <div className="nova-card p-6 flex items-center gap-6 border-primary bg-primary/5">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-xl shadow-primary/5">
                  <Truck className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-black text-primary">الدفع عند الاستلام</h4>
                  <p className="text-sm text-primary/40 font-medium mt-1">خدمة الدفع نقداً للمندوب عند وصول طلبيتكِ الملكية</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-8">
              <div className="nova-card p-10 border-border shadow-premium">
                <h3 className="text-2xl font-black text-primary mb-10 border-b border-border pb-6">ملخص الحقيبة</h3>
                
                <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto no-scrollbar">
                  {cart.map((item) => (
                    <div key={item.variant.sku} className="flex gap-4 p-4 bg-accent/20 rounded-2xl border border-border/50">
                      <div className="h-20 w-16 relative rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-primary text-sm truncate">{item.name}</p>
                        <p className="text-xs text-primary/40 mt-1">{item.variant.color} / {item.variant.size} × {item.quantity}</p>
                      </div>
                      <p className="font-black text-primary text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between text-primary/40 font-bold">
                    <span>المجموع الفرعي</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-primary/40 font-bold">
                    <span>أجور التوصيل ({formData.province})</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  <div className="h-px bg-border my-6" />
                  <div className="flex justify-between text-3xl font-black text-primary">
                    <span>الإجمالي</span>
                    <span className="text-secondary">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button 
                  disabled={isSubmitting || cart.length === 0}
                  onClick={handlePlaceOrder}
                  size="lg" 
                  className="w-full h-20 rounded-full text-2xl font-black bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب الآن"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
