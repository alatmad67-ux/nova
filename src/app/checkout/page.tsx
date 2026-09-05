
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  Loader2,
  Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Header } from '@/components/layout/Header';
import { useCart } from '@/providers/cart-provider';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { doc, collection, serverTimestamp, runTransaction, query, where, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { STORE_ID } from '@/lib/constants';
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ id: string, number: string } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryPrice, setDeliveryPrice] = useState(5000);

  const addrQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'addresses'), where('storeId', '==', STORE_ID));
  }, [db, user]);

  const { data: addresses, loading: addressesLoading } = useCollection(addrQuery);

  const selectedAddress = useMemo(() => {
    return addresses?.find(a => a.id === selectedAddressId) || addresses?.find(a => a.isDefault) || addresses?.[0];
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (selectedAddress && db) {
      const fetchRate = async () => {
        const rateRef = doc(db, 'shipping-rates', `${STORE_ID}_${selectedAddress.governorate}`);
        const snap = await getDoc(rateRef);
        if (snap.exists()) {
          setDeliveryPrice(snap.data().price);
        } else {
          setDeliveryPrice(5000); // Default if not set
        }
      };
      fetchRate();
    }
  }, [selectedAddress, db]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal + deliveryPrice;

  const handlePlaceOrder = async () => {
    if (!db || !user || !selectedAddress) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار عنوان للتوصيل" });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderNumber = `NOVA-${Math.floor(100000 + Math.random() * 900000)}`;
      
      await runTransaction(db, async (transaction) => {
        // Create Order Record
        const orderData = {
          orderNumber,
          customerId: user.uid,
          customerName: user.displayName || 'عميل',
          shippingAddress: selectedAddress,
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
            shipping: deliveryPrice,
            total
          },
          status: 'جديد',
          storeId: STORE_ID,
          createdAt: serverTimestamp()
        };

        const newOrderRef = doc(collection(db, 'orders'));
        transaction.set(newOrderRef, orderData);
        setOrderResult({ id: newOrderRef.id, number: orderNumber });
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الطلب", description: "حدث خطأ أثناء معالجة الطلب" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user && !userLoading) {
    router.push('/login?redirect=/checkout');
    return null;
  }

  if (orderResult) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-arabic">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-12 rounded-[4rem] bg-white border border-border shadow-premium">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-8" />
            <h1 className="text-3xl font-black text-primary mb-4">تم تثبيت طلبكِ!</h1>
            <p className="text-primary/60 mb-10 font-bold">رقم الطلب: #{orderResult.number}</p>
            <Button asChild className="w-full h-16 rounded-full bg-primary text-white font-black">
              <Link href="/account/orders">متابعة الطلبات</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-20">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-black text-primary mb-12">إتمام الطلبية الملكية</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-primary flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-secondary" /> عنوان التوصيل
                </h2>
                <Link href="/account/addresses" className="text-xs font-black text-primary/40 hover:text-primary transition-colors">إدارة العناوين</Link>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {addressesLoading ? (
                  <div className="h-32 bg-accent animate-pulse rounded-3xl" />
                ) : addresses?.length === 0 ? (
                  <Button asChild variant="outline" className="h-32 rounded-[2.5rem] border-dashed border-primary/20 flex flex-col gap-2">
                    <Link href="/account/addresses">
                      <Plus className="h-6 w-6" /> إضافة عنوانكِ الأول للتوصيل
                    </Link>
                  </Button>
                ) : (
                  addresses?.map((addr: any) => (
                    <button 
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={cn(
                        "p-6 rounded-[2rem] border text-right transition-all flex items-center justify-between",
                        (selectedAddressId === addr.id || (!selectedAddressId && addr.isDefault)) ? "border-primary bg-primary/5 shadow-md" : "border-border bg-white"
                      )}
                    >
                      <div>
                        <p className="font-black text-primary mb-1">{addr.label}</p>
                        <p className="text-xs text-primary/60 font-bold">{addr.governorate} - {addr.area}</p>
                      </div>
                      {(selectedAddressId === addr.id || (!selectedAddressId && addr.isDefault)) && <CheckCircle2 className="h-6 w-6 text-primary" />}
                    </button>
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-primary mb-8 flex items-center gap-3">
                <Truck className="h-6 w-6 text-secondary" /> طريقة الدفع
              </h2>
              <div className="bg-white p-6 rounded-[2rem] border border-primary/20 flex items-center gap-6">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary"><CreditCard className="h-6 w-6" /></div>
                <div className="flex-1">
                  <p className="font-black text-primary">الدفع عند الاستلام</p>
                  <p className="text-[10px] text-primary/40 font-bold">خدمة الدفع نقداً للمندوب عند وصول الطلبية</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-10 rounded-[3rem] border border-border shadow-premium sticky top-28">
              <h3 className="text-xl font-black text-primary mb-8 border-b border-border pb-4">ملخص الحقيبة</h3>
              <div className="space-y-6 mb-8 max-h-60 overflow-y-auto no-scrollbar">
                {cart.map(item => (
                  <div key={item.variant.sku} className="flex gap-4">
                    <div className="h-16 w-12 relative rounded-xl overflow-hidden bg-accent"><Image src={item.image} alt={item.name} fill className="object-cover" /></div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-primary line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-primary/40 font-bold">{item.variant.color} / {item.variant.size} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-black text-primary">{(item.price * item.quantity).toLocaleString()} د.ع</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex justify-between text-primary/40 font-bold text-sm"><span>المجموع الفرعي</span><span>{subtotal.toLocaleString()} د.ع</span></div>
                <div className="flex justify-between text-primary/40 font-bold text-sm"><span>أجور التوصيل ({selectedAddress?.governorate || 'بغداد'})</span><span>{deliveryPrice.toLocaleString()} د.ع</span></div>
                <div className="h-px bg-border my-4" />
                <div className="flex justify-between text-2xl font-black text-primary"><span>الإجمالي</span><span className="text-secondary">{total.toLocaleString()} د.ع</span></div>
              </div>
              <Button 
                onClick={handlePlaceOrder} 
                disabled={isSubmitting || !selectedAddress}
                className="w-full h-16 rounded-full bg-primary text-white text-xl font-black mt-8 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "تأكيد الطلب الآن"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
