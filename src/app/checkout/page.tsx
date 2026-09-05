
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  MapPin, 
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Plus,
  Package,
  MessageCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCart } from '@/providers/cart-provider';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { doc, collection, serverTimestamp, setDoc, query, where, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { STORE_ID } from '@/lib/constants';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ id: string, number: string, total: number, address: any } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryPrice, setDeliveryPrice] = useState(0);

  const addrQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'addresses'), where('storeId', '==', STORE_ID));
  }, [db, user]);

  const { data: addresses, loading: addressesLoading } = useCollection(addrQuery);

  const selectedAddress = useMemo(() => {
    if (!addresses) return null;
    return addresses.find(a => a.id === selectedAddressId) || addresses.find(a => a.isDefault) || addresses[0];
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (selectedAddress && db) {
      const fetchRate = async () => {
        const rateRef = doc(db, 'shipping-rates', `${STORE_ID}_${selectedAddress.governorate}`);
        const snap = await getDoc(rateRef);
        if (snap.exists() && snap.data().isActive) {
          setDeliveryPrice(snap.data().price);
        } else {
          setDeliveryPrice(5000); // Fallback default
        }
      };
      fetchRate();
    }
  }, [selectedAddress, db]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal + deliveryPrice;

  const handlePlaceOrder = async () => {
    if (!db || !user || !selectedAddress) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار عنوان التوصيل" });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
      const newOrderRef = doc(collection(db, 'orders'));
      
      const orderData = {
        orderNumber,
        customerId: user.uid,
        customerName: user.displayName || 'جميلة نوفا',
        customerPhone: user.phoneNumber || selectedAddress.phone || '',
        customerEmail: user.email || '',
        shippingAddress: selectedAddress,
        governorate: selectedAddress.governorate,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.variant.color,
          size: item.variant.size,
          sku: item.variant.sku,
          image: item.image
        })),
        totals: {
          subtotal,
          shipping: deliveryPrice,
          total
        },
        status: 'جديد',
        storeId: STORE_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(newOrderRef, orderData);
      
      // Send internal notification (Permissions fixed in rules)
      await setDoc(doc(collection(db, 'notifications')), {
        userId: user.uid,
        title: 'تم استلام طلبكِ بنجاح ✨',
        body: `طلبكِ رقم #${orderNumber} قيد المراجعة الآن.`,
        type: 'order',
        orderId: newOrderRef.id,
        isRead: false,
        storeId: STORE_ID,
        createdAt: serverTimestamp()
      });

      setOrderResult({ 
        id: newOrderRef.id, 
        number: orderNumber, 
        total: total,
        address: selectedAddress
      });
      clearCart();
    } catch (error: any) {
      console.error("Order Error:", error);
      toast({ 
        variant: "destructive", 
        title: "فشل إرسال الطلب", 
        description: error.message?.includes('permission') ? "خطأ في الصلاحيات، يرجى المحاولة لاحقاً" : "يرجى التأكد من اتصالكِ بالإنترنت" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendToWhatsApp = () => {
    if (!orderResult) return;
    const phone = '9647858833838';
    const message = `مرحباً NOVA، أود تأكيد طلبي الجديد:
رقم الطلبية: #${orderResult.number}
المبلغ الإجمالي: ${orderResult.total.toLocaleString()} د.ع
العنوان: ${orderResult.address.governorate} - ${orderResult.address.area}
شكراً لكم ✨`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (userLoading) return <div className="min-h-screen bg-background flex items-center justify-center font-black animate-pulse">جاري التحقق...</div>;
  
  if (!user) {
    router.push('/login?redirect=/checkout');
    return null;
  }

  if (orderResult) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-arabic">
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-md bg-white p-10 rounded-[4rem] border border-border/50 shadow-premium">
            <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 mx-auto mb-8 shadow-inner">
               <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-black text-primary mb-4">تم تثبيت طلبكِ!</h1>
            <p className="text-primary/40 font-bold mb-10 text-sm">رقم الطلبية هو <span className="text-primary">#{orderResult.number}</span>. يرجى الضغط على الزر أدناه لإرسال التفاصيل عبر واتساب لسرعة التأكيد.</p>
            
            <div className="space-y-4">
              <Button 
                onClick={sendToWhatsApp}
                className="w-full h-16 rounded-[2rem] bg-green-500 text-white text-lg font-black shadow-xl hover:bg-green-600 transition-all gap-3"
              >
                <MessageCircle className="h-6 w-6" />
                تأكيد عبر واتساب
              </Button>
              <Button asChild variant="ghost" className="w-full h-14 rounded-2xl text-primary/40 font-black">
                <Link href="/account/orders">عرض طلباتي</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32">
      <header className="h-20 flex items-center px-6 justify-between bg-white border-b border-border/30">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">إتمام الطلبية</h1>
        <div className="w-10" />
      </header>

      <main className="flex-grow container mx-auto px-5 py-8 space-y-10">
        {/* Address Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-primary flex items-center gap-3">
              <MapPin className="h-5 w-5 text-secondary" /> عنوان التوصيل
            </h2>
            <Link href="/account/addresses" className="text-xs font-black text-primary/40 underline">تغيير</Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {addressesLoading ? (
              <div className="h-32 bg-accent animate-pulse rounded-[2.5rem]" />
            ) : !addresses || addresses.length === 0 ? (
              <Button asChild variant="outline" className="h-32 rounded-[2.5rem] border-dashed border-primary/20 flex flex-col gap-2">
                <Link href="/account/addresses"><Plus className="h-6 w-6" /> أضيفي عنوانكِ الأول</Link>
              </Button>
            ) : (
              <div className="bg-white p-6 rounded-[2.5rem] border border-primary/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <p className="font-black text-primary text-lg mb-1">{selectedAddress?.label}</p>
                <p className="text-xs font-bold text-primary/60">{selectedAddress?.governorate} - {selectedAddress?.area}</p>
                <p className="text-[10px] text-primary/30 mt-1">{selectedAddress?.street}</p>
              </div>
            )}
          </div>
        </section>

        {/* Payment Method */}
        <section>
           <h2 className="text-xl font-black text-primary flex items-center gap-3 mb-6">
            <CreditCard className="h-5 w-5 text-secondary" /> طريقة الدفع
          </h2>
          <div className="bg-white p-6 rounded-[2.5rem] border border-primary/10 flex items-center gap-5 shadow-sm">
             <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <Package className="h-6 w-6" />
             </div>
             <div>
               <p className="font-black text-primary text-sm">الدفع عند الاستلام</p>
               <p className="text-[10px] text-primary/40 font-bold">نقداً للمندوب عند وصول الطلبية</p>
             </div>
             <CheckCircle2 className="mr-auto h-6 w-6 text-primary" />
          </div>
        </section>

        {/* Summary Card */}
        <div className="bg-primary text-white p-10 rounded-[3.5rem] shadow-2xl shadow-primary/30 space-y-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
           <h3 className="text-xl font-black border-b border-white/10 pb-4">ملخص الطلبية الملكية</h3>
           <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold text-white/40">
                <span>قيمة القطع</span>
                <span>{subtotal.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white/40">
                <span>أجور التوصيل ({selectedAddress?.governorate || 'بغداد'})</span>
                <span>{deliveryPrice.toLocaleString()} د.ع</span>
              </div>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex justify-between text-2xl font-black">
                <span>الإجمالي</span>
                <span className="text-secondary">{total.toLocaleString()} د.ع</span>
              </div>
           </div>
           
           <Button 
            onClick={handlePlaceOrder} 
            disabled={isSubmitting || !selectedAddress || cart.length === 0}
            className="w-full mt-6 h-16 rounded-[2rem] bg-white text-primary text-xl font-black hover:scale-[1.02] transition-all shadow-xl"
           >
             {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "تأكيد الطلبية الآن"}
           </Button>
        </div>
      </main>
    </div>
  );
}
