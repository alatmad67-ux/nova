
"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, doc, deleteDoc, updateDoc, where } from 'firebase/firestore';
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
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  MoreVertical 
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useStore } from '@/providers/store-provider';

export default function AdminProductsPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const productsQuery = useMemo(() => 
    query(collection(db, 'products'), where('storeId', '==', storeId)), [db, storeId]);
    
  const { data: products, loading } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const sorted = [...products].sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
    return sorted.filter((p: any) => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنتِ متأكدة؟')) return;
    await deleteDoc(doc(db, 'products', id));
    toast({ title: "تم الحذف" });
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    await updateDoc(doc(db, 'products', id), { status: newStatus });
    toast({ title: "تم التحديث" });
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic">
        <AdminHeader />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black text-primary">المنتجات</h1>
              <p className="text-primary/40 text-sm mt-1">إدارة جميع القطع المتاحة في NOVA</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-full md:w-80 group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                <Input placeholder="ابحثي عن منتج..." className="h-12 pr-12 bg-accent/30 border-border rounded-2xl text-primary font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Button asChild className="h-12 px-8 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
                <Link href="/admin/products/new"><Plus className="ml-2 h-5 w-5" /> إضافة منتج</Link>
              </Button>
            </div>
          </div>

          <div className="nova-card overflow-hidden border-border">
            <Table>
              <TableHeader className="bg-accent/50">
                <TableRow className="border-border">
                  <TableHead className="text-primary/60 font-black text-right">المنتج</TableHead>
                  <TableHead className="text-primary/60 font-black text-right">القسم</TableHead>
                  <TableHead className="text-primary/60 font-black text-right">السعر</TableHead>
                  <TableHead className="text-primary/60 font-black text-right text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => (
                  <TableRow key={product.id} className="border-border hover:bg-accent/20 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-12 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-accent">
                          <Image src={product.images?.[0] || 'https://picsum.photos/seed/placeholder/200/300'} alt={product.name} fill className="object-cover" />
                        </div>
                        <span className="font-bold text-primary">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="border-primary/10 text-primary/60 text-[10px] font-bold">{product.categoryName}</Badge></TableCell>
                    <TableCell className="font-black text-primary">{product.price?.toLocaleString()} د.ع</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => toggleStatus(product.id, product.status)} className="p-2 bg-accent rounded-lg text-primary/40 hover:text-primary transition-all">
                          {product.status === 'active' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 rounded-lg text-white hover:bg-red-600 transition-all shadow-sm"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
