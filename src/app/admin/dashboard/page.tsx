"use client";

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
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

export default function AdminDashboard() {
  const db = useFirestore();
  const router = useRouter();
  const { storeId } = useStore();
  
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), where('storeId', '==', storeId)), [db, storeId]);
  const { data: rawOrders } = useCollection(ordersQuery);
  
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
      totalCustomers: new Set(validOrders.map(o => o.customer?.phone)).size,
      totalProducts: products?.length || 0
    };
  }, [orders, products]);

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
    { label: 'إدارة الأقسام', icon: LayoutGrid, href: '/admin/categories', color: 'bg-secondary' },
    { label: 'السلايدر', icon: ImageIcon, href: '/admin/slider', color: 'bg-primary/60' },
    { label: 'الإعدادات', icon: SettingsIcon, href: '/admin/settings', color: 'bg-secondary/60' },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                <span className="text-xs font-black tracking-widest uppercase text-primary">نظام إدارة NOVA</span>
              </div>
              <h1 className="text-4xl font-black text-primary">لوحة التحكم</h1>
            </div>
            <div className="flex items-center gap-3">
              <img src="https://picsum.photos/seed/admin/100/100" className="h-10 w-10 rounded-full border-2 border-primary/10" alt="Admin" />
              <div className="text-right">
                <p className="text-xs font-bold text-primary">مرحباً، Admin</p>
                <p className="text-[10px] text-primary/40">مدير المتجر</p>
              </div>
            </div>
          </div>

          {/* Stats Grid - Inspired by the reference image */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary"><ShoppingBag className="h-5 w-5" /></div>
                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
              </div>
              <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">إجمالي المبيعات</p>
              <p className="text-2xl font-black text-primary">{stats.todaySales.toLocaleString()} د.ع</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary"><TrendingUp className="h-5 w-5" /></div>
                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+8%</span>
              </div>
              <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">إجمالي الطلبات</p>
              <p className="text-2xl font-black text-primary">{stats.totalOrders}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary"><Users className="h-5 w-5" /></div>
                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+15%</span>
              </div>
              <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">العملاء</p>
              <p className="text-2xl font-black text-primary">{stats.totalCustomers}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary"><Package className="h-5 w-5" /></div>
              </div>
              <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">المنتجات</p>
              <p className="text-2xl font-black text-primary">{stats.totalProducts}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-10 rounded-[2.5rem] border border-border shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-primary">المبيعات</h3>
                  <select className="bg-muted px-4 py-2 rounded-xl text-xs font-bold outline-none border-none">
                    <option>هذا الأسبوع</option>
                    <option>هذا الشهر</option>
                  </select>
                </div>
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
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '1rem', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} 
                      />
                      <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black text-primary px-2">روابط سريعة</h3>
              <div className="grid grid-cols-2 gap-4">
                {QUICK_ACTIONS.map((action, i) => (
                  <button 
                    key={i} 
                    onClick={() => router.push(action.href)}
                    className="bg-white p-6 rounded-3xl border border-border hover:border-primary/30 transition-all flex flex-col items-center gap-3 group"
                  >
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg", action.color)}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 group-hover:text-primary">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}