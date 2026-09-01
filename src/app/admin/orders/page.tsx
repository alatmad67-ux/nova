
"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, doc, updateDoc, where } from 'firebase/firestore';
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
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Eye, Truck, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useStore } from '@/providers/store-provider';

const STATUS_OPTIONS = [
  "جديد", "تم التأكيد", "قيد التجهيز", "جاهز للشحن", "مع شركة التوصيل", "تم التسليم", "ملغي", "مرتجع"
];

export default function AdminOrdersPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // استعلام بسيط لتجنب أخطاء الفهارس
  const ordersQuery = useMemo(() => 
    query(
      collection(db, 'orders'), 
      where('storeId', '==', storeId)
    ), [db, storeId]);
    
  const { data: orders, loading } = useCollection(ordersQuery);

  // الترتيب والفلترة يدوياً
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    // الترتيب حسب التاريخ تنازلياً
    const sorted = [...orders].sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });

    return sorted.filter((o: any) => {
      const matchesSearch = o.orderNumber?.includes(searchTerm) || 
                           o.customer?.name?.includes(searchTerm) || 
                           o.customer?.phone?.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast({ title: "تم التحديث", description: `تم تغيير حالة الطلب إلى ${newStatus}` });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل التحديث", description: "حدث خطأ أثناء تغيير حالة الطلب" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'تم التسليم': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'ملغي': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'مع شركة التوصيل': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl md:text-5xl font-black gold-text">إدارة الطلبات</h1>
              <p className="text-white/40 text-sm mt-2">متابعة شحنات NOVA وحالات التوصيل</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="رقم الطلب، الاسم، الهاتف..."
                  className="h-11 pr-10 bg-white/5 border-white/10 rounded-xl w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all" className="bg-slate-900">جميع الحالات</option>
                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="nova-card overflow-hidden border border-white/5 bg-white/5 backdrop-blur-xl">
            {loading ? (
              <div className="py-20 text-center text-primary animate-pulse">جاري تحميل سجلات NOVA...</div>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-white/60 font-black text-right">رقم الطلب</TableHead>
                    <TableHead className="text-white/60 font-black text-right">العميلة</TableHead>
                    <TableHead className="text-white/60 font-black text-right">المجموع</TableHead>
                    <TableHead className="text-white/60 font-black text-right">الشحن</TableHead>
                    <TableHead className="text-white/60 font-black text-right">الحالة</TableHead>
                    <TableHead className="text-white/60 font-black text-center">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: any) => (
                    <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-black text-primary py-6">#{order.orderNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{order.customer?.name}</span>
                          <span className="text-[10px] text-white/30 dir-ltr">{order.customer?.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-black gold-text">
                        {order.totals?.total?.toLocaleString()} د.ع
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Truck className={cn("h-3 w-3", order.shippingInfo?.trackingNumber ? "text-primary" : "text-white/20")} />
                            <span className="text-[10px] font-bold text-white/60">{order.shippingInfo?.companyName || 'لم يحدد'}</span>
                          </div>
                          {order.shippingInfo?.trackingNumber && (
                            <span className="text-[9px] font-mono text-white/20 tracking-tighter">#{order.shippingInfo.trackingNumber}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-bold px-3 py-1 text-[10px]", getStatusColor(order.status))}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-3">
                          <Link href={`/admin/orders/${order.id}`} className="p-2 bg-white/5 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Select 
                            defaultValue={order.status} 
                            onValueChange={(val) => handleStatusChange(order.id, val)}
                          >
                            <SelectTrigger className="w-[120px] bg-white/5 border-white/10 rounded-lg text-[10px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                              {STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt} value={opt} className="focus:bg-primary focus:text-black">
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-white/20 font-bold">لا توجد طلبات مطابقة للبحث</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </AdminGuard>
  );
}
