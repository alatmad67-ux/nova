
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
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  // استعلام بسيط بدون orderBy لتجنب أخطاء الفهارس
  const productsQuery = useMemo(() => 
    query(
      collection(db, 'products'), 
      where('storeId', '==', storeId)
    ), [db, storeId]);
    
  const { data: products, loading } = useCollection(productsQuery);

  // الترتيب اليدوي والبحث
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    // الترتيب حسب التاريخ تنازلياً
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
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح من قاعدة البيانات" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حذف المنتج" });
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    try {
      await updateDoc(doc(db, 'products', id), { status: newStatus });
      toast({ title: "تم التحديث", description: `حالة المنتج الآن: ${newStatus === 'active' ? 'نشط' : 'مسودة'}` });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث حالة المنتج" });
    }
  };

  const calculateTotalStock = (variants: any[]) => {
    return variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">إدارة المجموعات</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black gold-text">المنتجات</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-full md:w-80 group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="ابحثي عن منتج..." 
                  className="h-12 pr-12 bg-white/5 border-white/10 rounded-2xl text-white font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild className="h-12 px-8 rounded-2xl bg-primary text-black font-black hover:scale-105 transition-all">
                <Link href="/admin/products/new">
                  <Plus className="ml-2 h-5 w-5" />
                  إضافة منتج جديد
                </Link>
              </Button>
            </div>
          </div>

          <div className="nova-card overflow-hidden border border-white/5 bg-white/5 backdrop-blur-xl">
            {loading ? (
              <div className="py-20 text-center text-primary animate-pulse">جاري جرد مخزن NOVA...</div>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-white/60 font-black text-right">المنتج</TableHead>
                    <TableHead className="text-white/60 font-black text-right">SKU</TableHead>
                    <TableHead className="text-white/60 font-black text-right">القسم</TableHead>
                    <TableHead className="text-white/60 font-black text-right">السعر</TableHead>
                    <TableHead className="text-white/60 font-black text-right">المخزون</TableHead>
                    <TableHead className="text-white/60 font-black text-right">الحالة</TableHead>
                    <TableHead className="text-white/60 font-black text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: any) => {
                    const totalStock = calculateTotalStock(product.variants);
                    return (
                      <TableRow key={product.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative h-16 w-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                              <Image 
                                src={product.images?.[0] || 'https://picsum.photos/seed/placeholder/200/300'} 
                                alt={product.name || 'Product'} 
                                fill 
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white line-clamp-1">{product.name}</span>
                              <span className="text-[10px] text-white/30 uppercase tracking-widest">{product.material || 'خامة فاخرة'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white/40 font-mono text-xs">{product.sku || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-white/10 text-white/60 text-[10px] font-bold">
                            {product.categoryName}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-black gold-text">
                          {product.price?.toLocaleString()} د.ع
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className={cn(
                              "text-xs font-black",
                              totalStock === 0 ? "text-red-500" : totalStock <= 5 ? "text-yellow-500" : "text-green-500"
                            )}>
                              {totalStock} قطعة
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <button 
                            onClick={() => toggleStatus(product.id, product.status)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border transition-all",
                              product.status === 'active' 
                                ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                : "bg-white/5 text-white/40 border-white/10"
                            )}
                          >
                            {product.status === 'active' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            {product.status === 'active' ? 'نشط' : 'مسودة'}
                          </button>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-white/20 hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white">
                              <DropdownMenuItem asChild className="focus:bg-primary focus:text-black font-bold">
                                <Link href={`/admin/products/${product.id}/edit`}>
                                  <Edit className="ml-2 h-4 w-4" />
                                  تعديل
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-red-500 focus:text-white font-bold text-red-400" onClick={() => handleDelete(product.id)}>
                                <Trash2 className="ml-2 h-4 w-4" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20 text-white/20 font-bold">لا توجد منتجات مطابقة لعملية البحث</TableCell>
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
