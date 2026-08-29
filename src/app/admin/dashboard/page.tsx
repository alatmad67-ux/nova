
"use client";

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import Link from 'next/link';

export default function AdminDashboard() {
  const db = useFirestore();
  
  // Real-time Queries
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc')), [db]);
  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);
  
  const productsQuery = useMemo(() => query(collection(db, 'products')), [db]);
  const { data: products } = useCollection(productsQuery);
  
  const customersQuery = useMemo(() => query(collection(db, 'orders')), [db]);
  const { data: customersData } = useCollection(customersQuery);

  // Stats Logic
  const stats = useMemo(() => {
    if (!orders) return null;

    const today = startOfDay(new Date());
    const todayOrders = orders.filter(o => {
      const date = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date();
      return date >= today;
    });

    const todaySales = todayOrders.reduce((acc, o) => acc + (o.status !== 'ملغي' ? o.totals.total : 0), 0);
    const monthSales = orders.filter(o => o.status !== 'ملغي').reduce((acc, o) => acc + o.totals.total, 0);

    return {
      todaySales,
      monthSales,
      totalOrders: orders.length,
      newOrders: orders.filter(o => o.status === 'جديد').length,
      pending: orders.filter(o => o.status === 'قيد التجهيز').length,
      shipping: orders.filter(o => o.status === 'جاهز للشحن' || o.status === 'مع شركة التوصيل').length,
      completed: orders.filter(o => o.status === 'تم التسليم').length,
      cancelled: orders.filter(o => o.status === 'ملغي').length,
      totalCustomers: new Set(orders.map(o => o.customer.phone)).size
    };
  }, [orders]);

  const lowStockItems = useMemo(() => {
    if (!products) return [];
    const items: any[] = [];
    products.forEach(p => {
      p.variants?.forEach((v: any) => {
        if (v.stock <= 5) { // Assuming 5 is low stock threshold
          items.push({
            id: p.id,
            name: p.name,
            color: v.color,
            size: v.size,
            stock: v.stock
          });
        }
      });
    });
    return items.slice(0, 5);
  }, [products]);

  // Chart Data (Mocking daily sales for last 7 days from real orders)
  const chartData = useMemo(() => {
    if (!orders) return [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayTotal = orders
        .filter(o => {
          const oDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date();
          return oDate >= dayStart && oDate <= dayEnd && o.status !== 'ملغي';
        })
        .reduce((acc, o) => acc + o.totals.total, 0);

      data.push({
        name: format(date, 'EEE', { locale: ar }),
        sales: dayTotal
      });
    }
    return data;
  }, [orders]);

  if (ordersLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري تحميل البيانات الفلكية...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-arabic">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">نظرة عامة</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black gold-text">لوحة التحكم</h1>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
            <span className="text-xs font-bold text-white/40 px-4">التوقيت: {format(new Date(), 'pp', { locale: ar })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'مبيعات اليوم', value: `${stats?.todaySales.toLocaleString()} د.ع`, icon: TrendingUp, color: 'text-green-400' },
            { label: 'طلبات جديدة', value: stats?.newOrders, icon: ShoppingBag, color: 'text-primary' },
            { label: 'قيد التجهيز', value: stats?.pending, icon: Clock, color: 'text-blue-400' },
            { label: 'منخفض المخزون', value: lowStockItems.length, icon: AlertTriangle, color: 'text-yellow-500' }
          ].map((s, i) => (
            <div key={i} className="nova-card p-8 celestial-glow flex items-center gap-6">
              <div className={cn("h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center", s.color)}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{s.label}</p>
                <p className="text-2xl font-black text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sales Chart */}
          <div className="lg:col-span-2">
            <div className="nova-card p-10 h-full">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-white">إحصائيات المبيعات</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 text-xs font-bold bg-primary text-black rounded-lg">آخر 7 أيام</button>
                </div>
              </div>
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
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.3)" 
                      fontSize={10} 
                      fontWeight="bold"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)" 
                      fontSize={10} 
                      fontWeight="bold"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `${val/1000}k`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Low Stock Widget */}
          <div className="space-y-8">
            <div className="nova-card p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-white">تنبيه المخزون</h3>
                <Link href="/admin/inventory" className="text-xs text-primary font-bold hover:underline">عرض الكل</Link>
              </div>
              <div className="space-y-6">
                {lowStockItems.length > 0 ? lowStockItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white">{item.name}</span>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.color} / {item.size}</span>
                    </div>
                    <div className="text-center">
                      <span className={cn("text-xs font-black px-3 py-1 rounded-lg", item.stock === 0 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400")}>
                        {item.stock} قطع
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-20">
                    <Package className="h-10 w-10 mx-auto mb-4" />
                    <p className="text-sm font-bold">المخزون سليم</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/orders" className="nova-card p-6 flex flex-col items-center justify-center gap-3 hover:border-primary transition-all">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-xs font-black text-white">الطلبات</span>
              </Link>
              <Link href="/admin/products" className="nova-card p-6 flex flex-col items-center justify-center gap-3 hover:border-primary transition-all">
                <Package className="h-6 w-6 text-primary" />
                <span className="text-xs font-black text-white">المنتجات</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
