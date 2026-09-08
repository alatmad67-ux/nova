"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, doc, updateDoc, where, orderBy } from 'firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Eye, Truck, Search, Calendar, Filter, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useStore } from '@/providers/store-provider';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const STATUS_OPTIONS = [
  "جديد", "تم التأكيد", "قيد التجهيز", "جاهز للشحن", "مع شركة التوصيل", "تم التسليم", "ملغي", "مرتجع"
];

export default function AdminOrdersPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const ordersQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'orders'), 
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );
  }, [db, storeId]);
    
  const { data: orders, loading, error } = useCollection(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter((o: any) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = (o.orderNumber?.toLowerCase().includes(search)) || 
                           (o.customerName?.toLowerCase().includes(search)) || 
                           (o.customerPhone?.includes(searchTerm));
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!db) return;
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "تم التحديث", description: `تم تغيير حالة الطلب إلى ${newStatus}` });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل التحديث", description: "حدث خطأ أثناء تغيير حالة الطلب" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/20';
      case 'تم التأكيد': return 'bg-cyan-50 dark:bg-cyan-900/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/20';
      case 'تم التسليم': return 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/20';
      case 'ملغي': return 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/20';
      case 'مع شركة التوصيل': return 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/20';
      default: return 'bg-primary/5 dark:bg-zinc-800 text-primary dark:text-zinc-300 border-primary/10 dark:border-zinc-700';
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors" dir="rtl">
        <AdminHeader />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-primary dark:text-zinc-100">إدارة الطلبات</h1>
              <p className="text-primary/40 dark:text-zinc-500 text-sm mt-2">متابعة شحنات NOVA وحالات التوصيل للمحافظات</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 dark:text-zinc-600 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="رقم الطلب، اسم الزبونة، الهاتف..."
                  className="h-11 pr-10 bg-accent/30 dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-xl w-full md:w-80 text-primary dark:text-zinc-100 font-bold focus:border-primary/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-accent/30 dark:bg-zinc-800 rounded-xl px-4 border border-border dark:border-zinc-700">
                <Filter className="h-4 w-4 text-primary/20 dark:text-zinc-600" />
                <select 
                  className="h-11 bg-transparent text-xs font-black text-primary dark:text-zinc-100 outline-none appearance-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all" className="dark:text-black">جميع الحالات</option>
                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="dark:text-black">{opt}</option>)}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[2rem] text-red-600 dark:text-red-400 flex items-center gap-4">
               <AlertCircle className="h-6 w-6" />
               <div>
                 <p className="font-black">خطأ في جلب البيانات من Firestore</p>
                 <p className="text-xs font-bold opacity-80">{error.message}</p>
               </div>
            </div>
          )}

          <div className="nova-card overflow-hidden border-border dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-premium transition-colors">
            {loading && filteredOrders.length === 0 ? (
              <div className="py-20 text-center text-primary dark:text-zinc-700 animate-pulse font-black opacity-20 italic">جاري جلب الطلبات من Firestore...</div>
            ) : (
              <Table>
                <TableHeader className="bg-accent/50 dark:bg-zinc-800/50">
                  <TableRow className="border-border dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">رقم الطلب</TableHead>
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">الزبونة</TableHead>
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">المحافظة</TableHead>
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">المجموع</TableHead>
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">الحالة</TableHead>
                    <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-center">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: any) => (
                    <TableRow key={order.id} className="border-border dark:border-zinc-800 hover:bg-accent/20 dark:hover:bg-zinc-800/40 transition-colors">
                      <TableCell className="font-black text-primary dark:text-zinc-100 py-6">#{order.orderNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary dark:text-zinc-300">{order.customerName}</span>
                          <span className="text-[10px] text-primary/30 dark:text-zinc-500 dir-ltr text-right">{order.customerPhone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                           <Truck className="h-3 w-3 text-secondary" />
                           <span className="text-xs font-bold text-primary/60 dark:text-zinc-400">{order.governorate}</span>
                         </div>
                      </TableCell>
                      <TableCell className="font-black text-secondary">
                        {(order.totals?.total || 0).toLocaleString()} د.ع
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-black px-3 py-1 text-[10px]", getStatusColor(order.status))}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-3">
                          <Link href={`/admin/orders/${order.id}`} className="p-2 bg-accent dark:bg-zinc-800 rounded-lg hover:text-primary dark:hover:text-zinc-100 transition-all text-primary/40 dark:text-zinc-600">
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Select 
                            defaultValue={order.status} 
                            onValueChange={(val) => handleStatusChange(order.id, val)}
                          >
                            <SelectTrigger className="w-[120px] bg-accent/50 dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-lg text-[10px] h-9 font-black text-primary dark:text-zinc-100">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 border-border dark:border-zinc-800 text-primary dark:text-zinc-100 font-bold" dir="rtl">
                              {STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt} value={opt} className="focus:bg-primary focus:text-white">
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-primary/20 dark:text-zinc-800 font-bold italic">لا توجد طلبات مطابقة للبحث</TableCell>
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
