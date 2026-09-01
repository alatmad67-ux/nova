
"use client";

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  Clock,
  Sparkles,
  LayoutGrid,
  Image as ImageIcon,
  Settings as SettingsIcon,
  ChevronLeft
} from 'lucide-react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
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
import { format, startOfDay, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { useStore } from '@/providers/store-provider';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const db = useFirestore();
  const router = useRouter();
  const { storeId } = useStore();
  
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), where('storeId', '==', storeId)), [db, storeId]);
  const { data: rawOrders, loading: ordersLoading } = useCollection(ordersQuery);
  
  const productsQuery = useMemo(() => query(collection(db, 'products'), where('storeId', '==', storeId)), [db, storeId]);
  const { data: products } = useCollection(productsQuery);

  const orders = useMemo(() => {
    if (!rawOrders) return [];
    return [...rawOrders].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [rawOrders]);

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const validOrders = orders || [];
    const todaySales = validOrders
      .filter(o => (o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date()) >= today && o.status !== 'ملغي')
      .reduce((acc, o) => acc + (o.totals?.total || 0), 0);

    return {
      todaySales,
      totalOrders: validOrders.length,
      newOrders: validOrders.filter(o => o.status === 'جديد').length,
      totalCustomers: new Set(validOrders.map(o => o.customer?.phone)).size
    };
  }, [orders]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTotal = orders
        .filter(o => {
          const oDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date();
          return format(oDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && o.status !== 'ملغي';
        })
        .reduce((acc, o) => acc + (o.totals?.total || 0), 0);
      data.push({ name: format(date, 'EEE', { locale: ar }), sales: dayTotal });
    }
    return data;
  }, [orders]);

  const QUICK_ACTIONS = [
    { label: 'إضافة منتج', icon: ShoppingBag, href: '/admin/products/new', color: 'bg-primary' },
    { label: 'إدارة الأقسام', icon: LayoutGrid, href: '/admin/categories', color: 'bg-blue-500' },
    { label: 'السلايدر المتحرك', icon: ImageIcon, href: '/admin/slider', color: 'bg-purple-500' },
    { label: 'إعدادات المتجر', icon: SettingsIcon, href: '/admin/settings', color: 'bg-orange-500' },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-black text-white flex flex-col font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-widest uppercase text-primary">نظام إدارة NOVA</span>
              </div>
              <h1 className="text-4xl font-black gold-text">لوحة التحكم</h1>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {QUICK_ACTIONS.map((action, i) => (
              <button 
                key={i} 
                onClick={() => router.push(action.href)}
                className="nova-card p-6 flex flex-col items-center gap-4 hover:scale-105 transition-all group"
              >
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg", action.color)}>
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Stats & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="nova-card p-10">
                <h3 className="text-xl font-black text-white mb-10 flex items-center justify-between">أداء المبيعات (أسبوع) <TrendingUp className="h-5 w-5 text-primary" /></h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }} />
                      <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="nova-card p-8 flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20"><TrendingUp className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">مبيعات اليوم</p>
                  <p className="text-xl font-black text-white">{stats.todaySales.toLocaleString()} د.ع</p>
                </div>
              </div>
              <div className="nova-card p-8 flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><ShoppingBag className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">طلبات جديدة</p>
                  <p className="text-xl font-black text-white">{stats.newOrders} طلب</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
