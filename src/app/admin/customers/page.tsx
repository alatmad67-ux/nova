"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  ShoppingBag, 
  MapPin, 
  Calendar,
  ChevronLeft,
  Filter,
  Eye,
  UserCircle2
} from 'lucide-react';
import { useStore } from '@/providers/store-provider';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';

export default function AdminCustomersPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const ordersQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'orders'),
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );
  }, [db, storeId]);

  const { data: orders, loading } = useCollection(ordersQuery);

  const customers = useMemo(() => {
    if (!orders) return [];
    
    // تجميع العملاء بناءً على المعرف (customerId للمسجلين، وPhone للضيوف)
    const customerMap = new Map();

    orders.forEach(order => {
      // استخدام customerId كأولوية، ثم الهاتف كبديل للـ Guest
      const id = order.customerId || order.customerPhone;
      if (!id) return;

      if (!customerMap.has(id)) {
        customerMap.set(id, {
          id,
          uid: order.customerId || null,
          name: order.customerName,
          phone: order.customerPhone,
          email: order.customerEmail || '',
          province: order.governorate,
          orderCount: 0,
          totalSpent: 0,
          firstOrder: order.createdAt,
          lastOrder: order.createdAt,
          lastOrderNumber: order.orderNumber,
          isGuest: !order.customerId
        });
      }

      const stats = customerMap.get(id);
      stats.orderCount += 1;
      
      // احتساب المشتريات فقط للطلبات غير الملغاة
      if (order.status !== 'ملغي') {
        stats.totalSpent += (order.totals?.total || 0);
      }

      // تحديث تواريخ الطلبات
      if (order.createdAt?.seconds < stats.firstOrder?.seconds) stats.firstOrder = order.createdAt;
      if (order.createdAt?.seconds > stats.lastOrder?.seconds) {
        stats.lastOrder = order.createdAt;
        stats.lastOrderNumber = order.orderNumber;
      }
    });

    let result = Array.from(customerMap.values());

    // البحث
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(search) || 
        c.phone?.includes(searchTerm) || 
        c.email?.toLowerCase().includes(search)
      );
    }

    // الترتيب
    if (sortBy === 'latest') result.sort((a, b) => b.lastOrder?.seconds - a.lastOrder?.seconds);
    if (sortBy === 'spent') result.sort((a, b) => b.totalSpent - a.totalSpent);
    if (sortBy === 'orders') result.sort((a, b) => b.orderCount - a.orderCount);
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    return result;
  }, [orders, searchTerm, sortBy]);

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors" dir="rtl">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-widest uppercase text-primary dark:text-zinc-500">إدارة المجتمع</span>
              </div>
              <h1 className="text-4xl font-black text-primary dark:text-zinc-100">قائمة العملاء</h1>
              <p className="text-primary/40 dark:text-zinc-500 text-sm mt-1">تتبع رحلة زبائن NOVA وتحليل سلوك الشراء</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-80 group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 dark:text-zinc-600 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="ابحث بالاسم أو الهاتف..." 
                  className="h-12 pr-12 bg-accent/30 dark:bg-zinc-800 border-none rounded-2xl text-primary dark:text-zinc-100 font-bold focus:ring-2 focus:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 bg-accent/30 dark:bg-zinc-800 rounded-2xl px-4 border border-border dark:border-zinc-700">
                <Filter className="h-4 w-4 text-primary/20 dark:text-zinc-600" />
                <select 
                  className="h-12 bg-transparent text-xs font-black text-primary dark:text-zinc-100 outline-none cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="latest" className="dark:text-black">أحدث طلب</option>
                  <option value="spent" className="dark:text-black">أعلى المشتريات</option>
                  <option value="orders" className="dark:text-black">عدد الطلبات</option>
                  <option value="name" className="dark:text-black">الاسم أبجدياً</option>
                </select>
              </div>
            </div>
          </div>

          <div className="nova-card overflow-hidden border border-border dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
            {loading ? (
              <div className="py-20 text-center font-black animate-pulse text-primary/20 dark:text-zinc-800">جاري جرد قاعدة بيانات العملاء...</div>
            ) : (
              <Table>
                <TableHeader className="bg-accent/50 dark:bg-zinc-800/50">
                  <TableRow className="border-border dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">العميلة</TableHead>
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">معلومات التواصل</TableHead>
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-center">الطلبات</TableHead>
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">إجمالي المشتريات</TableHead>
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">آخر طلب</TableHead>
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-center">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="border-border dark:border-zinc-800 hover:bg-accent/20 dark:hover:bg-zinc-800/40 transition-colors">
                      <TableCell className="py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/5 dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-zinc-100">
                             <UserCircle2 className="h-6 w-6" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="font-black text-primary dark:text-zinc-100">{customer.name}</p>
                            <Badge variant="outline" className={cn(
                              "text-[8px] h-4 mt-1 border-none font-black",
                              customer.isGuest ? "bg-orange-50 dark:bg-orange-900/10 text-orange-600" : "bg-primary/5 text-primary"
                            )}>
                              {customer.isGuest ? "ضيف" : "حساب مسجل"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-primary dark:text-zinc-300 dir-ltr text-right">{customer.phone}</span>
                          <span className="text-[10px] text-primary/40 dark:text-zinc-500 truncate max-w-[150px]">{customer.email || 'لا يوجد بريد'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-accent dark:bg-zinc-800 text-primary dark:text-zinc-100 font-black border-none px-3">
                          {customer.orderCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-black text-secondary text-lg">
                          {customer.totalSpent.toLocaleString()} <span className="text-[8px] text-secondary/60">د.ع</span>
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-primary/60 dark:text-zinc-400">
                          <span className="font-bold flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {customer.lastOrder?.seconds ? format(new Date(customer.lastOrder.seconds * 1000), 'yyyy/MM/dd') : '-'}
                          </span>
                          <span className="text-[9px] opacity-40">#{customer.lastOrderNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link 
                          href={`/admin/customers/${customer.id}`} 
                          className="p-2 inline-flex bg-accent dark:bg-zinc-800 rounded-lg text-primary/20 dark:text-zinc-600 hover:text-primary transition-all shadow-sm"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {customers.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-primary/20 dark:text-zinc-800 font-black italic">
                        لم يتم العثور على عملاء مطابقين للبحث
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
