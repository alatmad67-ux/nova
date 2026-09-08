"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, doc, deleteDoc, updateDoc, where, orderBy } from 'firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  EyeOff,
  Pencil
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/providers/store-provider';

export default function AdminProductsPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const productsQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'products'), 
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );
  }, [db, storeId]);
    
  const { data: products, loading } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!db || !confirm('هل أنتِ متأكدة من حذف هذا المنتج نهائياً؟')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "تم الحذف" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (!db) return;
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    try {
      await updateDoc(doc(db, 'products', id), { status: newStatus });
      toast({ title: "تم التحديث" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors">
        <AdminHeader />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black text-primary dark:text-zinc-100">المنتجات</h1>
              <p className="text-primary/40 dark:text-zinc-500 text-sm mt-1">إدارة جميع القطع المتاحة في NOVA</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-full md:w-80 group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 dark:text-zinc-600 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="ابحثي عن منتج..." 
                  className="h-12 pr-12 bg-accent/30 dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-2xl text-primary dark:text-zinc-100 font-bold focus:border-primary/50" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <Button asChild className="h-12 px-8 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
                <Link href="/admin/products/new"><Plus className="ml-2 h-5 w-5" /> إضافة منتج</Link>
              </Button>
            </div>
          </div>

          <div className="nova-card overflow-hidden border-border dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
            <Table>
              <TableHeader className="bg-accent/50 dark:bg-zinc-800/50">
                <TableRow className="border-border dark:border-zinc-800">
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">المنتج</TableHead>
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">القسم</TableHead>
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">السعر</TableHead>
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && filteredProducts.length === 0 ? (
                   <TableRow><TableCell colSpan={4} className="text-center py-20 font-bold animate-pulse text-primary/20 dark:text-zinc-800">جاري تحميل مجموعة NOVA...</TableCell></TableRow>
                ) : filteredProducts.map((product: any, idx: number) => (
                  <TableRow key={`${product.id}-${idx}`} className="border-border dark:border-zinc-800 hover:bg-accent/20 dark:hover:bg-zinc-800/40 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-12 rounded-lg overflow-hidden border border-border dark:border-zinc-700 flex-shrink-0 bg-accent dark:bg-zinc-800">
                          <Image src={product.images?.[0] || 'https://picsum.photos/seed/placeholder/200/300'} alt={product.name} fill className="object-cover" />
                        </div>
                        <span className="font-bold text-primary dark:text-zinc-300">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="border-primary/10 dark:border-zinc-700 text-primary/60 dark:text-zinc-400 text-[10px] font-bold">{product.categoryName}</Badge></TableCell>
                    <TableCell className="font-black text-primary dark:text-zinc-100">{product.price?.toLocaleString()} د.ع</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3">
                        <Link href={`/admin/products/${product.id}`} className="p-2 bg-accent dark:bg-zinc-800 rounded-lg text-primary/40 dark:text-zinc-600 hover:text-primary dark:hover:text-zinc-300 transition-all">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button onClick={() => toggleStatus(product.id, product.status)} className="p-2 bg-accent dark:bg-zinc-800 rounded-lg text-primary/40 dark:text-zinc-600 hover:text-primary dark:hover:text-zinc-300 transition-all">
                          {product.status === 'active' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 dark:bg-red-900/10 rounded-lg text-red-500 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && !loading && (
                   <TableRow><TableCell colSpan={4} className="text-center py-20 font-bold text-primary/20 dark:text-zinc-800">لا توجد منتجات مطابقة للبحث</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
