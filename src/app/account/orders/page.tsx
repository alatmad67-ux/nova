"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { BottomNav } from '@/components/layout/BottomNav';
import { 
  Package, 
  ChevronRight, 
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

  // تبسيط الاستعلام ليكون متوافقاً مع الفهرس الأساسي المقبول في Firebase
  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'orders'),
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'جديد': return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' };
      case 'تم التأكيد': return { icon: CheckCircle2, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' };
      case 'تم التسليم': return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' };
      case 'ملغي': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
      default: return { icon: Truck, color: 'text-secondary', bg: 'bg-accent dark:bg-zinc-800' };
    }
  };

  if (userLoading || (ordersLoading && !orders)) return (
    <div className="min-h-screen bg-background dark:bg-[#050505] flex items-center justify-center text-primary dark:text-zinc-100 font-black animate-pulse">
      جاري تحميل حقيبة طلباتكِ...
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] font-arabic pb-32" dir="rtl">
      <header className="h-20 flex items-center px-6 justify-between bg-white dark:bg-zinc-900 sticky top-0 z-40 border-b border-border/50 dark:border-zinc-800 transition-colors">
        <button onClick={() => router.push('/account')} className="h-10 w-10 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-zinc-300">
          <ChevronRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary dark:text-zinc-100 uppercase tracking-widest">طلباتي</h1>
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
                className="block bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-sm border border-border/50 dark:border-zinc-800 hover:border-primary/20 transition-all active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="font-black text-primary dark:text-zinc-100 text-lg">طلب #{order.orderNumber}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-primary/40 dark:text-zinc-500 font-bold mt-1 text-right">
                      <Calendar className="h-3 w-3" />
                      {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'PPP', { locale: ar }) : 'قيد المزامنة'}
                    </div>
                  </div>
                  <div className={cn("px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm", statusInfo.bg)}>
                    <statusInfo.icon className={cn("h-3.5 w-3.5", statusInfo.color)} />
                    <span className={cn("text-[10px] font-black", statusInfo.color)}>{order.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5 py-5 border-y border-border/50 dark:border-zinc-800">
                   <div className="h-14 w-14 rounded-2xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary/40 dark:text-zinc-600">
                      <Package className="h-7 w-7" strokeWidth={1.5} />
                   </div>
                   <div className="flex-1 text-right">
                      <p className="text-xs font-black text-primary/60 dark:text-zinc-400">{order.items?.length || 0} قطع في الطلبية</p>
                      <div className="flex items-baseline gap-1 mt-1 justify-end">
                         <p className="text-lg font-black text-primary dark:text-zinc-100">{(order.totals?.total || 0).toLocaleString()}</p>
                         <p className="text-[10px] font-bold text-primary/30 dark:text-zinc-600">د.ع</p>
                      </div>
                   </div>
                   <div className="h-10 w-10 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary/20 dark:text-zinc-600">
                      <ChevronRight className="h-5 w-5 rotate-180" />
                   </div>
                </div>

                <div className="pt-4 flex items-center gap-2 opacity-40 justify-end">
                  <p className="text-[9px] font-black text-primary dark:text-zinc-500 uppercase tracking-widest">NOVA Official Store</p>
                  <div className="h-1 w-1 rounded-full bg-primary" />
                </div>
              </Link>
            );
          })
        ) : !ordersLoading && (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-primary/10 dark:border-zinc-800">
            <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-primary/10 dark:text-zinc-800" />
            <h3 className="text-2xl font-black text-primary dark:text-zinc-100 mb-2">لا توجد طلبات بعد</h3>
            <p className="text-sm text-primary/40 dark:text-zinc-500 font-bold mb-10 max-w-[200px] mx-auto">ابدأي رحلتكِ مع الأناقة الآن واكتشفي مجموعتنا</p>
            <Button asChild className="rounded-full px-12 h-14 bg-primary text-white text-lg font-black shadow-xl shadow-primary/20">
              <Link href="/shop">اكتشفي المجموعات</Link>
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
