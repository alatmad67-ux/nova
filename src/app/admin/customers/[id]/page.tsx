"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  User, 
  Smartphone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  TrendingUp, 
  Calendar,
  Clock,
  Package,
  Eye,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react';
import { useStore } from '@/providers/store-provider';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from "@/lib/utils";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { storeId } = useStore();

  // جلب كافة طلبات هذا العميل (سواء بالـ UID أو الهاتف)
  const ordersQuery = useMemo(() => {
    if (!db || !id || !storeId) return null;
    
    // إذا كان الـ ID عبارة عن UID (طويل) أو رقم هاتف
    const idStr = id as string;
    const field = idStr.length > 20 ? 'customerId' : 'customerPhone';
    
    return query(
      collection(db, 'orders'),
      where('storeId', '==', storeId),
      where(field, '==', idStr),
      orderBy('createdAt', 'desc')
    );
  }, [db, id, storeId]);

  const { data: orders, loading } = useCollection(ordersQuery);

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    
    const completedOrders = orders.filter(o => o.status === 'تم التسليم');
    const totalSpent = orders.filter(o => o.status !== 'ملغي').reduce((acc, o) => acc + (o.totals?.total || 0), 0);
    
    return {
      name: orders[0].customerName,
      phone: orders[0].customerPhone,
      email: orders[0].customerEmail || 'غير متوفر',
      province: orders[0].governorate,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: orders.filter(o => o.status === 'ملغي').length,
      totalSpent,
      avgOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
      joinedAt: orders[orders.length - 1].createdAt
    };
  }, [orders]);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-black animate-pulse text-primary dark:text-zinc-100">
      جاري جلب سجل الزبونة...
    </div>
  );

  if (!stats) return <div className="min-h-screen flex items-center justify-center">العميل غير موجود</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors" dir="rtl">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex items-center gap-6 mb-12">
            <button onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary/40 hover:text-primary transition-all">
              <ChevronRight className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-primary dark:text-zinc-100">ملف الزبونة</h1>
              <p className="text-primary/40 dark:text-zinc-500 text-sm mt-1">تاريخ المعاملات والولاء لمتجر NOVA</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Info Card */}
            <div className="space-y-6">
              <div className="nova-card p-10 bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="h-20 w-20 rounded-full bg-primary/5 dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-zinc-100 mb-4 border border-primary/10">
                    <User className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-black text-primary dark:text-zinc-100">{stats.name}</h3>
                  <Badge variant="outline" className="mt-2 border-primary/10 text-primary/40 dark:text-zinc-500 font-bold uppercase text-[9px] tracking-widest">NOVA Customer</Badge>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-secondary"><Smartphone className="h-5 w-5" /></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-primary/30 dark:text-zinc-500 uppercase">رقم الهاتف</p>
                      <p className="font-bold text-primary dark:text-zinc-100 dir-ltr">{stats.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-secondary"><Mail className="h-5 w-5" /></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-primary/30 dark:text-zinc-500 uppercase">البريد الإلكتروني</p>
                      <p className="font-bold text-primary dark:text-zinc-100 truncate max-w-[150px]">{stats.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-secondary"><MapPin className="h-5 w-5" /></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-primary/30 dark:text-zinc-500 uppercase">المحافظة</p>
                      <p className="font-bold text-primary dark:text-zinc-100">{stats.province}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-secondary"><Calendar className="h-5 w-5" /></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-primary/30 dark:text-zinc-500 uppercase">تاريخ الانضمام</p>
                      <p className="font-bold text-primary dark:text-zinc-100">
                        {stats.joinedAt?.seconds ? format(new Date(stats.joinedAt.seconds * 1000), 'PPP', { locale: ar }) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-primary/10 dark:border-zinc-800">
                <h4 className="text-xs font-black text-primary dark:text-zinc-100 uppercase tracking-widest mb-6">الخلاصة المالية</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-primary/40 dark:text-zinc-500">إجمالي المشتريات</span>
                    <span className="text-secondary font-black">{stats.totalSpent.toLocaleString()} د.ع</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-primary/40 dark:text-zinc-500">متوسط قيمة الطلب</span>
                    <span className="text-primary dark:text-zinc-300">{Math.round(stats.avgOrderValue).toLocaleString()} د.ع</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats and Orders */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'إجمالي الطلبات', val: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-500' },
                  { label: 'طلبات ناجحة', val: stats.completedOrders, icon: CheckCircle2, color: 'text-green-500' },
                  { label: 'طلبات ملغاة', val: stats.cancelledOrders, icon: XCircle, color: 'text-red-500' },
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-border dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className={cn("h-12 w-12 rounded-2xl bg-accent dark:bg-zinc-800 flex items-center justify-center", s.color)}>
                      <s.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary/40 dark:text-zinc-500 uppercase">{s.label}</p>
                      <p className="text-xl font-black text-primary dark:text-zinc-100">{s.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black text-primary dark:text-zinc-100 px-2 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-secondary" />
                  سجل الطلبات التاريخي
                </h3>

                <div className="space-y-4">
                  {orders?.map((order: any) => (
                    <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-border dark:border-zinc-800 shadow-sm group hover:border-primary/20 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                           <div className="h-14 w-14 rounded-2xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary/40 dark:text-zinc-600">
                              <Package className="h-7 w-7" />
                           </div>
                           <div>
                             <div className="flex items-center gap-2 mb-1">
                               <h4 className="font-black text-lg text-primary dark:text-zinc-100">طلب #{order.orderNumber}</h4>
                               <Badge variant="outline" className={cn(
                                 "text-[10px] border-none font-black h-5",
                                 order.status === 'تم التسليم' ? "bg-green-50 dark:bg-green-900/10 text-green-600" :
                                 order.status === 'ملغي' ? "bg-red-50 dark:bg-red-900/10 text-red-600" :
                                 "bg-blue-50 dark:bg-blue-900/10 text-blue-600"
                               )}>
                                 {order.status}
                               </Badge>
                             </div>
                             <div className="flex items-center gap-3 text-[10px] text-primary/30 dark:text-zinc-500 font-bold uppercase tracking-widest">
                               <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'yyyy/MM/dd') : '-'}</span>
                               <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> {order.governorate}</span>
                             </div>
                           </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-10">
                          <div className="text-left">
                            <p className="text-[10px] font-black text-primary/30 dark:text-zinc-500 uppercase mb-1">المبلغ الإجمالي</p>
                            <p className="text-xl font-black text-secondary">{(order.totals?.total || 0).toLocaleString()} <span className="text-[10px] opacity-60">د.ع</span></p>
                          </div>
                          <Link href={`/admin/orders/${order.id}`} className="h-12 w-12 rounded-xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary/20 dark:text-zinc-600 hover:text-primary transition-all">
                             <Eye className="h-6 w-6" />
                          </Link>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-border/50 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {order.items?.slice(0, 4).map((item: any, idx: number) => (
                           <div key={idx} className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-accent dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-primary/40 dark:text-zinc-500 overflow-hidden relative">
                                 {item.image ? <img src={item.image} alt="" className="object-cover" /> : <Package className="h-4 w-4" />}
                              </div>
                              <span className="text-[10px] font-bold text-primary/60 dark:text-zinc-400 truncate">{item.name}</span>
                           </div>
                        ))}
                        {order.items?.length > 4 && <span className="text-[10px] font-black text-primary/20 dark:text-zinc-700 flex items-center">+{order.items.length - 4} قطع أخرى</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}