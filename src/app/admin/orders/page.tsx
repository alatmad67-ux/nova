
"use client";

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
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
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const STATUS_OPTIONS = [
  "جديد", "تم التأكيد", "قيد التجهيز", "جاهز للشحن", "مع شركة التوصيل", "تم التسليم", "ملغي", "مرتجع"
];

export default function AdminOrdersPage() {
  const db = useFirestore();
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc')), [db]);
  const { data: orders, loading } = useCollection(ordersQuery);

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
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري تحميل الطلبات...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <h1 className="text-3xl md:text-5xl font-black mb-12 gold-text">إدارة الطلبات</h1>

        <div className="nova-card overflow-hidden border border-white/5 bg-white/5 backdrop-blur-xl">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/60 font-black text-right">رقم الطلب</TableHead>
                <TableHead className="text-white/60 font-black text-right">العميلة</TableHead>
                <TableHead className="text-white/60 font-black text-right">التاريخ</TableHead>
                <TableHead className="text-white/60 font-black text-right">المجموع</TableHead>
                <TableHead className="text-white/60 font-black text-right">الحالة</TableHead>
                <TableHead className="text-white/60 font-black text-right">الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order: any) => (
                <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-bold text-primary">#{order.orderNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{order.customer.name}</span>
                      <span className="text-xs text-white/40">{order.customer.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">
                    {order.createdAt?.seconds 
                      ? format(new Date(order.createdAt.seconds * 1000), 'PPP p', { locale: ar })
                      : 'قيد المعالجة'}
                  </TableCell>
                  <TableCell className="font-black gold-text">
                    {order.totals.total.toLocaleString()} د.ع
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-bold px-3 py-1", getStatusColor(order.status))}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={order.status} 
                      onValueChange={(val) => handleStatusChange(order.id, val)}
                    >
                      <SelectTrigger className="w-[140px] bg-white/5 border-white/10 rounded-xl text-xs h-9">
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
                  </TableCell>
                </TableRow>
              ))}
              {orders?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-white/20 font-bold">لا توجد طلبات بعد</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
