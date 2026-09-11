
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
  AlertCircle,
  BarChart3,
  Archive,
  MapPin
} from 'lucide-react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
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
import { format, startOfDay, subDays, isValid, startOfWeek, startOfMonth } from 'date-fns';
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
  
  const ordersQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'orders'), 
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );
  }, [db, storeId]);
  
  const { data: rawOrders, loading: ordersLoading } = useCollection(ordersQuery);
  
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
    const weekStart = startOfWeek(new Date());
    const orders = rawOrders || [];
    
    const filterByDate = (date: Date) => orders.filter(o => {
      const oDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
      return oDate && isValid(oDate) && oDate >= date && o.status !== 'ملغي';
    });

    const todayOrders = filterByDate(today);
    const weekOrders = filterByDate(weekStart);

    const todaySales = todayOrders.reduce((acc, o) => acc + (o.totals?.total || 0), 0);
    const weekSales = weekOrders.reduce((acc, o) => acc + (o.totals?.total || 0), 0);

    return {
      todaySales,
      weekSales,
      totalOrders: orders.length,
      newOrders: orders.filter(o => o.status === 'جديد').length,
      totalCustomers: new Set(orders.map(o => o.customerId || o.customerPhone).filter(Boolean)).size,
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
      const dayTotal = orders
        .filter(o => {
          const oDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
          return oDate && isValid(oDate) && format(oDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && o.status !== 'ملغي';
        })
        .reduce((acc, o) => acc + (o.totals?.total || 0), 0);
        
      data.push({ name: format(date, 'EEE', { locale: ar }), sales: dayTotal });
    }
    return data;
  }, [rawOrders]);

  const QUICK_ACTIONS = [
    { label: 'إدارة المنتجات', icon: ShoppingBag, href: '/admin/products', color: 'bg-primary' },
    { label: 'جرد المخزن', icon: Archive, href: '/admin/inventory', color: 'bg-orange-500' },
    { label: 'طلبات التوصيل', icon: Package, href: '/admin/orders', color: 'bg-indigo-600' },
    { label: 'أسعار الشحن', icon: MapPin, href: '/admin/shipping-rates', color: 'bg-teal-600' },
    { label: 'قائمة العملاء', icon: Users, href: '/admin/customers', color: 'bg-blue-500' },
    { label: 'الأقسام الرئيسية', icon: LayoutGrid, href: '/admin/categories', color: 'bg-secondary' },
    { label: 'تقارير المبيعات', icon: BarChart3, href: '/admin/reports', color: 'bg-green-500' },
    { label: 'إعدادات المتجر', icon: SettingsIcon, href: '/admin/settings', color: 'bg-gray-600' },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors" dir="rtl">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                <span className="text-xs font-black tracking-widest uppercase text-primary dark:text-zinc-500">نظام إدارة NOVA</span>
              </div>
              <h1 className="text-4xl font-black text-primary dark:text-zinc-100">لوحة التحكم</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12">
            {[
              { label: 'مبيعات اليوم', val: stats.todaySales, icon: ShoppingBag, color: 'text-primary' },
              { label: 'طلبات جديدة', val: stats.newOrders, icon: Clock, color: 'text-blue-500' },
              { label: 'إجمالي العملاء', val: stats.totalCustomers, icon: Users, color: 'text-secondary' },
              { label: 'إجمالي الطلبات', val: stats.totalOrders, icon: Package, color: 'text-purple-500' },
              { label: 'عدد المنتجات', val: stats.totalProducts, icon: LayoutGrid, color: 'text-orange-500' },
              { label: 'مبيعات الأسبوع', val: stats.weekSales, icon: TrendingUp, color: 'text-green-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-border dark:border-zinc-800 shadow-sm flex flex-col gap-2 group hover:scale-[1.02] transition-all">
                <div className={cn("h-8 w-8 rounded-lg bg-accent dark:bg-zinc-800 flex items-center justify-center", s.color)}>
                  <s.icon className="h-4 w-4" />
                </div>
                <p className="text-[9px] font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">{s.label}</p>
                <p className="text-lg font-black text-primary dark:text-zinc-100">
                  {typeof s.val === 'number' && s.label.includes('مبيعات') ? `${s.val.toLocaleString()} د.ع` : s.val}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-border dark:border-zinc-800 shadow-sm transition-all">
                <h3 className="text-xl font-black text-primary dark:text-zinc-100 mb-10">نشاط المبيعات (أسبوعي)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-10" vertical={false} />
                      <XAxis dataKey="name" stroke="#999" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#999" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '1rem',
                          fontFamily: 'inherit'
                        }} 
                      />
                      <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-border dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-primary dark:text-zinc-100">أحدث الطلبيات</h3>
                  <Link href="/admin/orders" className="text-xs font-black text-primary/40 dark:text-zinc-500 flex items-center gap-1 hover:text-primary transition-colors">
                    عرض كافة القوائم
                    <ChevronLeft className="h-3 w-3" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {ordersLoading ? (
                    <div className="py-10 text-center animate-pulse text-primary/20 dark:text-zinc-800 font-black">جاري مزامنة البيانات...</div>
                  ) : recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-accent/30 dark:bg-zinc-800/50 rounded-2xl border border-border/50 dark:border-zinc-800 group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-primary dark:text-zinc-100 shadow-sm">
                            <Clock className={cn("h-5 w-5", order.status === 'جديد' ? "animate-pulse text-blue-500" : "text-primary/20 dark:text-zinc-600")} />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-primary dark:text-zinc-100">#{order.orderNumber}</h4>
                            <p className="text-[10px] text-primary/40 dark:text-zinc-500 font-bold">{order.customerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-left">
                              <p className="font-black text-sm text-secondary">{(order.totals?.total || 0).toLocaleString()} د.ع</p>
                              <Badge variant="outline" className="text-[9px] h-5 border-primary/10 text-primary/60 dark:text-zinc-400">{order.status}</Badge>
                           </div>
                           <Link href={`/admin/orders/${order.id}`} className="p-2 bg-white dark:bg-zinc-800 rounded-lg text-primary/20 dark:text-zinc-700 group-hover:text-primary transition-all">
                              <Eye className="h-5 w-5" />
                           </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-primary/20 font-black italic">لا توجد سجلات حالياً</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-lg font-black text-primary dark:text-zinc-400 px-2">الوصول السريع للقوائم</h3>
              <div className="grid grid-cols-2 gap-4">
                {QUICK_ACTIONS.map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => router.push(action.href)}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-border dark:border-zinc-800 hover:border-primary/30 transition-all flex flex-col items-center gap-3 group shadow-sm"
                  >
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg", action.color)}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 dark:text-zinc-500 group-hover:text-primary text-center leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="bg-primary/5 dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-primary/10 dark:border-zinc-800">
                <h4 className="text-xs font-black text-primary dark:text-zinc-100 uppercase tracking-widest mb-4">نصيحة الإدارة</h4>
                <p className="text-xs font-bold text-primary/60 dark:text-zinc-400 leading-relaxed">
                  استخدمي ميزة "جرد المخزن" لتعديل كميات القطع التي أوشكت على النفاد مباشرة دون الحاجة للدخول لصفحة تعديل المنتج.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
