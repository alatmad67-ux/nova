
"use client";

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Package, 
  Clock,
  Sparkles,
  Truck,
  LogOut
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCollection, useFirestore, useAuth } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc')), [db]);
  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);
  
  const productsQuery = useMemo(() => query(collection(db, 'products')), [db]);
  const { data: products } = useCollection(productsQuery);

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
      totalCustomers: new Set(orders.map(o => o.customer.phone)).size
    };
  }, [orders]);

  const lowStockItems = useMemo(() => {
    if (!products) return [];
    const items: any[] = [];
    products.forEach(p => {
      p.variants?.forEach((v: any) => {
        if (v.stock <= 5) {
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

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  if (ordersLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري تحميل البيانات الفلكية...</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-black text-white flex flex-col font-arabic">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">إدارة الممالك</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black gold-text">لوحة تحكم NOVA</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/5 p-2 px-6 rounded-2xl border border-white/10 text-xs font-bold text-white/40">
                {format(new Date(), 'pppp', { locale: ar })}
              </div>
              <button 
                onClick={handleLogout}
                className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'مبيعات اليوم', value: `${stats?.todaySales.toLocaleString()} د.ع`, icon: TrendingUp, color: 'text-green-400' },
              { label: 'طلبات جديدة', value: stats?.newOrders, icon: ShoppingBag, color: 'text-primary' },
              { label: 'قيد التجهيز', value: stats?.pending, icon: Clock, color: 'text-blue-400' },
              { label: 'إجمالي العملاء', value: stats?.totalCustomers, icon: Users, color: 'text-purple-400' }
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
            <div className="lg:col-span-2">
              <div className="nova-card p-10 h-full">
                <h3 className="text-xl font-black text-white mb-10">إحصائيات المبيعات</h3>
                <div className="h-[350px] w-full">
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
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                      <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="nova-card p-10">
                <h3 className="text-lg font-black text-white mb-8">تنبيه المخزون</h3>
                <div className="space-y-6">
                  {lowStockItems.length > 0 ? lowStockItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white">{item.name}</span>
                        <span className="text-[10px] text-white/40 font-bold uppercase">{item.color} / {item.size}</span>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-none font-black">{item.stock} قطع</Badge>
                    </div>
                  )) : (
                    <div className="text-center py-10 opacity-20">
                      <Package className="h-10 w-10 mx-auto mb-4" />
                      <p className="text-sm font-bold">المخزون ممتلئ بالنجوم</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AdminGuard>
  );
}
