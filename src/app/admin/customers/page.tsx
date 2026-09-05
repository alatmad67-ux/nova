
"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Users, Search, ShoppingBag, MapPin, Sparkles } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function CustomersPage() {
  const db = useFirestore();
  
  const ordersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: orders, loading } = useCollection(ordersQuery);
  const [searchTerm, setSearchTerm] = useState('');

  const customers = useMemo(() => {
    if (!orders) return [];
    const customerMap = new Map();

    orders.forEach(order => {
      if (!order.customer?.phone) return;
      const phone = order.customer.phone;
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          name: order.customer.name,
          phone: order.customer.phone,
          province: order.customer.province,
          orderCount: 0,
          totalSpent: 0,
          lastOrder: order.createdAt
        });
      }
      
      const stats = customerMap.get(phone);
      stats.orderCount += 1;
      if (order.status !== 'ملغي') {
        stats.totalSpent += (order.totals?.total || 0);
      }
    });

    return Array.from(customerMap.values()).filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    );
  }, [orders, searchTerm]);

  if (loading && !orders) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black animate-pulse">جاري تحميل سجلات العملاء...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">المجتمع</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black gold-text">إدارة العملاء</h1>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="ابحث بالاسم أو الهاتف..." 
              className="h-14 pr-12 bg-white/5 border-white/10 rounded-2xl text-white font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="nova-card overflow-hidden border border-white/5 bg-white/5 backdrop-blur-xl">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/60 font-black text-right">العميلة</TableHead>
                <TableHead className="text-white/60 font-black text-right">الهاتف</TableHead>
                <TableHead className="text-white/60 font-black text-right">المحافظة</TableHead>
                <TableHead className="text-white/60 font-black text-right text-center">الطلبات</TableHead>
                <TableHead className="text-white/60 font-black text-right">إجمالي المشتريات</TableHead>
                <TableHead className="text-white/60 font-black text-right">آخر ظهور</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, idx) => (
                <TableRow key={idx} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-bold text-white py-6">{customer.name}</TableCell>
                  <TableCell className="text-white/60 font-bold">{customer.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-white/60">
                      <MapPin className="h-3 w-3 text-primary" />
                      {customer.province}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-primary/20 text-primary font-black px-3">
                      {customer.orderCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-black gold-text text-lg">
                    {customer.totalSpent.toLocaleString()} د.ع
                  </TableCell>
                  <TableCell className="text-white/20 text-xs">
                    {customer.lastOrder?.seconds 
                      ? new Date(customer.lastOrder.seconds * 1000).toLocaleDateString('ar-IQ')
                      : 'قيد المزامنة'}
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-white/20 font-bold">لا يوجد عملاء بعد</TableCell>
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
