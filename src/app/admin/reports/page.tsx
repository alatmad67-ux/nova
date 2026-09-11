"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Truck,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
  LayoutGrid
} from 'lucide-react';
import { useStore } from '@/providers/store-provider';
import { 
  format, 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  startOfYear, 
  isWithinInterval, 
  isValid,
  parseISO
} from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart as RechartsPieChart,
  Pie
} from 'recharts';

export default function AdminReportsPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [period, setPeriod] = useState('month'); // today, week, month, year, custom
  const [customRange, setCustomRange] = useState({ from: '', to: '' });

  const ordersQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'orders'),
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );
  }, [db, storeId]);

  const { data: rawOrders, loading } = useCollection(ordersQuery);

  const reportData = useMemo(() => {
    if (!rawOrders) return null;

    let startDate: Date;
    const now = new Date();

    switch (period) {
      case 'today': startDate = startOfDay(now); break;
      case 'week': startDate = startOfWeek(now); break;
      case 'month': startDate = startOfMonth(now); break;
      case 'year': startDate = startOfYear(now); break;
      case 'custom': startDate = customRange.from ? parseISO(customRange.from) : startOfMonth(now); break;
      default: startDate = startOfMonth(now);
    }

    const endDate = period === 'custom' && customRange.to ? parseISO(customRange.to) : now;

    const filteredOrders = rawOrders.filter(o => {
      const oDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
      if (!oDate || !isValid(oDate)) return false;
      return isWithinInterval(oDate, { start: startDate, end: endDate });
    });

    const completedOrders = filteredOrders.filter(o => o.status === 'تم التسليم');
    const inProgressOrders = filteredOrders.filter(o => !['تم التسليم', 'ملغي', 'مرتجع'].includes(o.status));
    const cancelledOrders = filteredOrders.filter(o => o.status === 'ملغي');

    const totalSales = completedOrders.reduce((acc, o) => acc + (o.totals?.total || 0), 0);
    const totalPotentialSales = filteredOrders.filter(o => o.status !== 'ملغي').reduce((acc, o) => acc + (o.totals?.total || 0), 0);
    const totalShipping = completedOrders.reduce((acc, o) => acc + (o.totals?.shipping || 0), 0);

    // المنتجات الأكثر مبيعاً
    const productStats: Record<string, any> = {};
    filteredOrders.forEach(order => {
      if (order.status === 'ملغي') return;
      order.items?.forEach((item: any) => {
        if (!productStats[item.name]) {
          productStats[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productStats[item.name].quantity += (item.quantity || 1);
        productStats[item.name].revenue += (item.price * item.quantity);
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // مبيعات حسب المحافظة
    const provinceStats: Record<string, number> = {};
    filteredOrders.forEach(o => {
      if (o.status === 'ملغي') return;
      const prov = o.governorate || 'أخرى';
      provinceStats[prov] = (provinceStats[prov] || 0) + 1;
    });

    const provinceData = Object.entries(provinceStats).map(([name, value]) => ({ name, value }));

    return {
      totalSales,
      totalPotentialSales,
      orderCount: filteredOrders.length,
      completedCount: completedOrders.length,
      inProgressCount: inProgressOrders.length,
      cancelledCount: cancelledOrders.length,
      totalShipping,
      avgOrderValue: completedOrders.length > 0 ? totalSales / completedOrders.length : 0,
      topProducts,
      provinceData
    };
  }, [rawOrders, period, customRange]);

  const COLORS = ['#5B2A86', '#C9A45C', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors" dir="rtl">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-widest uppercase text-primary dark:text-zinc-500">مركز التحليل</span>
              </div>
              <h1 className="text-4xl font-black text-primary dark:text-zinc-100">تقارير المبيعات</h1>
              <p className="text-primary/40 dark:text-zinc-500 text-sm mt-1">ذكاء الأعمال والنمو المالي لمتجر NOVA</p>
            </div>

            <div className="flex flex-wrap gap-2 bg-accent/30 dark:bg-zinc-900 p-1.5 rounded-2xl border border-border dark:border-zinc-800">
              {[
                { id: 'today', label: 'اليوم' },
                { id: 'week', label: 'الأسبوع' },
                { id: 'month', label: 'الشهر' },
                { id: 'year', label: 'السنة' },
                { id: 'custom', label: 'فترة مخصصة' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    period === p.id 
                      ? "bg-primary text-white shadow-lg" 
                      : "text-primary/40 dark:text-zinc-500 hover:text-primary dark:hover:text-zinc-300"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {period === 'custom' && (
            <div className="mb-10 p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-primary/10 dark:border-zinc-800 animate-in fade-in zoom-in-95 flex flex-wrap gap-6 items-end">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary/40 dark:text-zinc-500 pr-2">من تاريخ</label>
                  <input type="date" value={customRange.from} onChange={(e) => setCustomRange({...customRange, from: e.target.value})} className="h-12 px-4 bg-accent/30 dark:bg-zinc-800 rounded-xl border-none font-bold text-primary dark:text-zinc-100 outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary/40 dark:text-zinc-500 pr-2">إلى تاريخ</label>
                  <input type="date" value={customRange.to} onChange={(e) => setCustomRange({...customRange, to: e.target.value})} className="h-12 px-4 bg-accent/30 dark:bg-zinc-800 rounded-xl border-none font-bold text-primary dark:text-zinc-100 outline-none" />
               </div>
               <div className="text-[10px] font-bold text-primary/30 dark:text-zinc-600 pb-4">ملاحظة: سيتم تحديث التقارير تلقائياً عند اختيار التواريخ.</div>
            </div>
          )}

          {loading ? (
             <div className="py-20 text-center font-black animate-pulse text-primary/20 dark:text-zinc-800">جاري تحليل البيانات المالية...</div>
          ) : reportData ? (
            <div className="space-y-8">
              {/* Financial Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'إجمالي المبيعات (المحققة)', val: reportData.totalSales, icon: ShoppingBag, color: 'text-primary' },
                  { label: 'المبيعات المتوقعة', val: reportData.totalPotentialSales, icon: TrendingUp, color: 'text-secondary' },
                  { label: 'أجور التوصيل', val: reportData.totalShipping, icon: Truck, color: 'text-blue-500' },
                  { label: 'متوسط قيمة الطلب', val: reportData.avgOrderValue, icon: BarChart3, color: 'text-green-500' },
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-border dark:border-zinc-800 shadow-sm transition-all group">
                    <div className={cn("h-10 w-10 rounded-xl bg-accent dark:bg-zinc-800 flex items-center justify-center mb-6", s.color)}>
                       <s.icon className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-2xl font-black text-primary dark:text-zinc-100">
                      {Math.round(s.val).toLocaleString()} <span className="text-[10px] text-primary/30">د.ع</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'إجمالي الطلبيات', val: reportData.orderCount, icon: Package, color: 'bg-primary' },
                  { label: 'طلبيات مكتملة', val: reportData.completedCount, icon: CheckCircle2, color: 'bg-green-500' },
                  { label: 'طلبيات ملغاة', val: reportData.cancelledCount, icon: XCircle, color: 'bg-red-500' },
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-border dark:border-zinc-800 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white", s.color)}>
                        <s.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-primary/40 dark:text-zinc-500 uppercase">{s.label}</p>
                        <p className="text-xl font-black text-primary dark:text-zinc-100">{s.val}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products Chart */}
                <div className="nova-card p-10 bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-sm">
                  <h3 className="text-lg font-black text-primary dark:text-zinc-100 mb-10 flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-secondary" />
                    المنتجات الأكثر طلباً
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="opacity-10" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={120} fontSize={10} axisLine={false} tickLine={false} className="font-bold" />
                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', shadow: 'none', backgroundColor: '#f9f9f9' }} />
                        <Bar dataKey="revenue" radius={[0, 10, 10, 0]}>
                           {reportData.topProducts.map((_, index) => (
                             <Cell key={index} fill={COLORS[index % COLORS.length]} />
                           ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Province Distribution */}
                <div className="nova-card p-10 bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-sm">
                  <h3 className="text-lg font-black text-primary dark:text-zinc-100 mb-10 flex items-center gap-3">
                    <LayoutGrid className="h-5 w-5 text-secondary" />
                    توزيع المبيعات حسب المحافظة
                  </h3>
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={reportData.provinceData}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {reportData.provinceData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '1rem' }} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 pr-10">
                       {reportData.provinceData.slice(0, 5).map((item, i) => (
                         <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-primary/60 dark:text-zinc-400">
                           <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                           {item.name}: {item.value} طلبات
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-32 text-center opacity-20">
               <Package className="h-16 w-16 mx-auto mb-4" />
               <p className="font-black">لا توجد بيانات متاحة لهذه الفترة</p>
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
