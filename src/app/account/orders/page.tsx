
"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { 
  Package, 
  ChevronLeft, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle,
  Calendar,
  ShoppingBag
} from 'lucide-react';
import { STORE_ID } from '@/lib/constants';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyOrdersPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();

  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'orders'),
      where('customerId', '==', user.uid),
      where('storeId', '==', STORE_ID),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'جديد': return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'تم التسليم': return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' };
      case 'ملغي': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' };
      default: return { icon: Truck, color: 'text-secondary', bg: 'bg-accent' };
    }
  };

  if (userLoading || ordersLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black animate-pulse">
      جاري تحميل حقيبة طلباتكِ...
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32" dir="rtl">
      <header className="h-20 flex items-center px-6 justify-between bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-border/50">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">طلباتي</h1>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-5 py-6 space-y-4 max-w-lg">
        {orders && orders.length > 0 ? (
          orders.map((order: any) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <Link 
                key={order.id} 
                href={`/account/orders/${order.id}`}
                className="block bg-white rounded-[2rem] p-5 shadow-sm border border-border/50 hover:border-primary/20 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-primary">طلب #{order.orderNumber}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-primary/40 font-bold mt-1">
                      <Calendar className="h-3 w-3" />
                      {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'PPP', { locale: ar }) : 'قيد المزامنة'}
                    </div>
                  </div>
                  <div className={cn("px-3 py-1 rounded-full flex items-center gap-1.5", statusInfo.bg)}>
                    <statusInfo.icon className={cn("h-3 w-3", statusInfo.color)} />
                    <span className={cn("text-[10px] font-black", statusInfo.color)}>{order.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-border/50">
                   <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-primary/40">
                      <Package className="h-6 w-6" />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black text-primary/60">{order.items?.length || 0} قطع في الطلبية</p>
                      <p className="text-sm font-black text-primary mt-0.5">{order.totals?.total?.toLocaleString()} د.ع</p>
                   </div>
                   <ChevronLeft className="h-5 w-5 text-primary/20 rotate-180" />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-primary/20">
            <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-primary/20" />
            <h3 className="text-xl font-black text-primary mb-2">لا توجد طلبات بعد</h3>
            <p className="text-sm text-primary/40 font-bold mb-8">ابدأينا رحلتكِ مع NOVA اليوم</p>
            <Button asChild className="rounded-full px-8 bg-primary text-white">
              <Link href="/shop">اكتشفي المجموعات</Link>
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
