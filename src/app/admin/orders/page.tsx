
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
import { Eye, Truck, Search, Filter, User2, UserCheck } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useStore } from '@/providers/store-provider';

const STATUS_OPTIONS = ["جديد", "تم التأكيد", "قيد التجهيز", "جاهز للشحن", "مع شركة التوصيل", "تم التسليم", "ملغي", "مرتجع"];

export default function AdminOrdersPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const ordersQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(collection(db, 'orders'), where('storeId', '==', storeId), orderBy('createdAt', 'desc'));
  }, [db, storeId]);
    
  const { data: orders, loading } = useCollection(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o: any) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = (o.orderNumber?.toLowerCase().includes(search)) || (o.customerName?.toLowerCase().includes(search)) || (o.customerPhone?.includes(searchTerm));
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus, updatedAt: new Date().toISOString() });
      toast({ title: "تم التحديث", description: `حالة الطلب الآن: ${newStatus}` });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في التحديث" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'تم التسليم': return 'bg-green-50 text-green-600 border-green-100';
      case 'ملغي': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-primary/5 text-primary border-primary/10';
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors" dir="rtl">
        <AdminHeader />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div><h1 className="text-3xl md:text-5xl font-black text-primary dark:text-zinc-100">إدارة الطلبات</h1><p className="text-primary/40 dark:text-zinc-500 text-sm mt-2">متابعة شحنات NOVA وحالات التوصيل</p></div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative group"><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-primary transition-colors" /><Input placeholder="رقم الطلب، الزبونة، الهاتف..." className="h-11 pr-10 bg-accent/30 border-none rounded-xl w-full md:w-80 font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
              <div className="flex items-center gap-2 bg-accent/30 rounded-xl px-4"><Filter className="h-4 w-4 text-primary/20" /><select className="h-11 bg-transparent text-xs font-black outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">جميع الحالات</option>{STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
            </div>
          </div>

          <div className="nova-card overflow-hidden border-border dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-premium transition-colors">
            {loading ? <div className="py-20 text-center animate-pulse font-black opacity-20">جاري جلب الطلبات...</div> : (
              <Table>
                <TableHeader className="bg-accent/50 dark:bg-zinc-800/50">
                  <TableRow className="border-border dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-primary/60 font-black text-right">رقم الطلب</TableHead>
                    <TableHead className="text-primary/60 font-black text-right">الزبونة</TableHead>
                    <TableHead className="text-primary/60 font-black text-right">نوع العميل</TableHead>
                    <TableHead className="text-primary/60 font-black text-right">المجموع</TableHead>
                    <TableHead className="text-primary/60 font-black text-right">الحالة</TableHead>
                    <TableHead className="text-primary/60 font-black text-center">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: any) => (
                    <TableRow key={order.id} className="border-border dark:border-zinc-800 hover:bg-accent/20 transition-colors">
                      <TableCell className="font-black text-primary dark:text-zinc-100 py-6">#{order.orderNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col"><span className="font-bold text-primary dark:text-zinc-300">{order.customerName}</span><span className="text-[10px] text-primary/30 dir-ltr text-right">{order.customerPhone}</span></div>
                      </TableCell>
                      <TableCell>
                        {order.isGuest ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 gap-1.5 font-black text-[9px]"><User2 className="h-3 w-3" /> طلب كزائر</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 gap-1.5 font-black text-[9px]"><UserCheck className="h-3 w-3" /> عميل مسجل</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-black text-secondary">{(order.totals?.total || 0).toLocaleString()} د.ع</TableCell>
                      <TableCell><Badge variant="outline" className={cn("font-black px-3 py-1 text-[10px]", getStatusColor(order.status))}>{order.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-3">
                          <Link href={`/admin/orders/${order.id}`} className="p-2 bg-accent dark:bg-zinc-800 rounded-lg text-primary/40"><Eye className="h-5 w-5" /></Link>
                          <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                            <SelectTrigger className="w-[120px] bg-accent/50 border-none rounded-lg text-[10px] h-9 font-black"><SelectValue /></SelectTrigger>
                            <SelectContent dir="rtl">{STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt} className="text-xs font-bold">{opt}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
