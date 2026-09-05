
"use client";

import React, { useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  Sparkles,
  LayoutGrid,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Truck,
  ChevronLeft,
  Clock,
  Eye,
  AlertCircle
} from 'lucide-react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { format, startOfDay, subDays, isValid } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { useStore } from '@/providers/store-provider';
import { initializeDatabase } from '@/lib/db-init';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const db = useFirestore();
  const router = useRouter();
  const { storeId } = useStore();
  const { user } = useUser();
  
  useEffect(() => {
    if (db && storeId && user) {
      initializeDatabase(db, storeId);
    }
  }, [db, storeId, user]);
  
  // استعلام الطلبات مع مراعاة تأخير الفهارس
  const ordersQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'orders'), 
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );
  }, [db, storeId]);
  
  const { data: rawOrders, loading: ordersLoading, error: ordersError } = useCollection(ordersQuery);
  
  const productsQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'products'), 
      where('storeId', '==', storeId)
    );
  }, [db, storeId]);
  
  const { data: products } = useCollection(productsQuery);

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const orders = rawOrders || [];
    
    const todaySales = orders
      .filter(o => {
        const oDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
        return oDate && isValid(oDate) && oDate >= today && o.status !== 'ملغي';
      })
      .reduce((acc, o) => acc + (o.totals?.total || 0), 0);

    return {
      todaySales,
      totalOrders: orders.length,
      totalCustomers: new Set(orders.map(o => o.customerPhone).filter(Boolean)).size,
      totalProducts: products?.length || 0
    };
  }, [rawOrders, products]);

  const recentOrders = useMemo(() => {
    return (rawOrders || []).slice(0, 5);
  }, [rawOrders]);

  const chartData = useMemo(() => {
    const orders = rawOrders || [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const dayTotal = orders
        .filter(o => {
          const oDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
          return oDate && isValid(oDate) && format(oDate, 'yyyy-MM-dd') === formattedDate && o.status !== 'ملغي';
        })
        .reduce((acc, o) => acc + (o.totals?.total || 0), 0);
        
      data.push({ name: format(date, 'EEE', { locale: ar }), sales: dayTotal });
    }
    return data;
  }, [rawOrders]);

  const QUICK_ACTIONS = [
    { label: 'إدارة الطلبات', icon: Package, href: '/admin/orders', color: 'bg-primary' },
    { label: 'إضافة منتج', icon: ShoppingBag, href: '/admin/products/new', color: 'bg-secondary' },
    { label: 'إدارة الأقسام', icon: LayoutGrid, href: '/admin/categories', color: 'bg-blue-600' },
    { label: 'أسعار التوصيل', icon: Truck, href: '/admin/shipping-rates', color: 'bg-green-600' },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background text-foreground font-arabic" dir="rtl">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          {ordersError && (
            <div className="mb-10 p-6 bg-red-50 border border-red-100 rounded-[2.5rem] text-red-600 flex items-center gap-4">
               <AlertCircle className="h-6 w-6" />
               <div>
                 <p className="font-black italic">نظام مراقبة الفهارس (Index Alert)</p>
                 <p className="text-xs font-bold opacity-80">الطلبات موجودة في قاعدة البيانات ولكن الفايربيس يحتاج لثوانٍ لبناء الفهرس. يرجى الانتظار.</p>
               </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                <span className="text-xs font-black tracking-widest uppercase text-primary">نظام إدارة NOVA</span>
              </div>
              <h1 className="text-4xl font-black text-primary">لوحة التحكم</h1>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'مبيعات اليوم', val: `${stats.todaySales.toLocaleString()} د.ع`, icon: ShoppingBag },
              { label: 'إجمالي الطلبات', val: stats.totalOrders, icon: TrendingUp },
              { label: 'العملاء', val: stats.totalCustomers, icon: Users },
              { label: 'المنتجات', val: stats.totalProducts, icon: Package },
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-2">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary"><s.icon className="h-5 w-5" /></div>
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{s.label}</p>
                <p className="text-xl md:text-2xl font-black text-primary">{s.val}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Chart */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-border shadow-sm">
                <h3 className="text-xl font-black text-primary mb-10">المبيعات (آخر 7 أيام)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#999" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#999" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '1rem' }} />
                      <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Orders Section */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-primary">أحدث الطلبات</h3>
                  <Link href="/admin/orders" className="text-xs font-black text-primary/40 flex items-center gap-1 hover:text-primary transition-colors">
                    عرض الكل
                    <ChevronLeft className="h-3 w-3" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {ordersLoading ? (
                    <div className="py-10 text-center animate-pulse text-primary/20 font-black">جاري مزامنة الطلبات...</div>
                  ) : recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-2xl border border-border/50 group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                            <Clock className={cn("h-5 w-5", order.status === 'جديد' ? "animate-pulse text-blue-500" : "text-primary/20")} />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-primary">#{order.orderNumber}</h4>
                            <p className="text-[10px] text-primary/40 font-bold">{order.customerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-left">
                              <p className="font-black text-sm text-secondary">{order.totals?.total?.toLocaleString()} د.ع</p>
                              <Badge variant="outline" className="text-[9px] h-5 border-primary/10 text-primary/60">{order.status}</Badge>
                           </div>
                           <Link href={`/admin/orders/${order.id}`} className="p-2 bg-white rounded-lg text-primary/20 group-hover:text-primary transition-all">
                              <Eye className="h-5 w-5" />
                           </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-primary/20 font-black italic">لا توجد طلبات بعد</div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Sidebar */}
            <div className="space-y-8">
              <h3 className="text-lg font-black text-primary px-2">إجراءات سريعة</h3>
              <div className="grid grid-cols-2 gap-4">
                {QUICK_ACTIONS.map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => router.push(action.href)}
                    className="bg-white p-6 rounded-3xl border border-border hover:border-primary/30 transition-all flex flex-col items-center gap-3 group shadow-sm"
                  >
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg", action.color)}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 group-hover:text-primary">{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Status Summary */}
              <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <h4 className="text-sm font-black mb-6 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  ملخص الحالة
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-60">طلبات جديدة</span>
                    <span className="font-black">{(rawOrders || []).filter(o => o.status === 'جديد').length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-60">قيد التجهيز</span>
                    <span className="font-black">{(rawOrders || []).filter(o => o.status === 'قيد التجهيز').length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-60">مع شركة التوصيل</span>
                    <span className="font-black">{(rawOrders || []).filter(o => o.status === 'مع شركة التوصيل').length}</span>
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
