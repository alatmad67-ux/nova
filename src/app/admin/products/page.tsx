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
  Pencil,
  Filter,
  LayoutGrid,
  Sparkles,
  Link as LinkIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/providers/store-provider';
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [mainCategoryFilter, setMainCategoryFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // جلب المجموعات الكبرى
  const mainCatQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(collection(db, 'main-categories'), where('storeId', '==', storeId), orderBy('order', 'asc'));
  }, [db, storeId]);
  const { data: mainCategories } = useCollection(mainCatQuery);

  // جلب الأقسام الفرعية
  const subCatQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(collection(db, 'categories'), where('storeId', '==', storeId));
  }, [db, storeId]);
  const { data: subCategories } = useCollection(subCatQuery);

  const productsQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'products'), 
      where('storeId', '==', storeId),
      orderBy('createdAt', 'desc')
    );
  }, [db, storeId]);
    
  const { data: products, loading, error: fetchError } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMain = mainCategoryFilter === 'all' || p.mainCategory === mainCategoryFilter;
      const matchesSub = categoryFilter === 'all' || p.categoryId === categoryFilter;
      
      return matchesSearch && matchesMain && matchesSub;
    });
  }, [products, searchTerm, categoryFilter, mainCategoryFilter]);

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

  const copyProductLink = (id: string) => {
    const link = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast({ title: "تم نسخ الرابط" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors" dir="rtl">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                <span className="text-xs font-black tracking-widest uppercase text-primary dark:text-zinc-500">إدارة القوائم</span>
              </div>
              <h1 className="text-4xl font-black text-primary dark:text-zinc-100">جرد المنتجات الملكي</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button asChild className="h-12 px-8 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
                <Link href="/admin/products/new"><Plus className="ml-2 h-5 w-5" /> إضافة منتج جديد</Link>
              </Button>
            </div>
          </div>

          {fetchError && (
             <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-6 rounded-[2.5rem] mb-8 flex items-center gap-4 text-red-600">
                <AlertCircle className="h-6 w-6" />
                <div>
                   <h4 className="font-black">خطأ في الاتصال بقاعدة البيانات</h4>
                   <p className="text-xs font-bold opacity-80">يرجى التحقق من استقرار الإنترنت وتحديث الصفحة.</p>
                </div>
             </div>
          )}

          {/* ترويسة الفلاتر - القوائم الذكية */}
          <div className="nova-card p-6 bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-sm mb-8 flex flex-wrap gap-4 items-center transition-all">
             <div className="flex items-center gap-3 bg-accent/30 dark:bg-zinc-800 rounded-xl px-4 flex-grow md:flex-grow-0 min-w-[200px]">
                <Search className="h-4 w-4 text-primary/20" />
                <Input 
                  placeholder="ابحثي بالاسم أو SKU..." 
                  className="h-11 bg-transparent border-none font-bold" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
             </div>

             <div className="flex items-center gap-3 bg-accent/30 dark:bg-zinc-800 rounded-xl px-4">
                <LayoutGrid className="h-4 w-4 text-primary/20" />
                <select 
                  className="h-11 bg-transparent text-xs font-black outline-none cursor-pointer min-w-[120px] dark:text-zinc-100"
                  value={mainCategoryFilter}
                  onChange={(e) => { setMainCategoryFilter(e.target.value); setCategoryFilter('all'); }}
                >
                   <option value="all">كل المجموعات</option>
                   {mainCategories?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
             </div>

             <div className="flex items-center gap-3 bg-accent/30 dark:bg-zinc-800 rounded-xl px-4">
                <Filter className="h-4 w-4 text-primary/20" />
                <select 
                  className="h-11 bg-transparent text-xs font-black outline-none cursor-pointer min-w-[120px] dark:text-zinc-100"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                   <option value="all">كل الأقسام</option>
                   {subCategories?.filter(s => mainCategoryFilter === 'all' || s.mainCategory === mainCategoryFilter).map(s => (
                     <option key={s.id} value={s.id}>{s.name}</option>
                   ))}
                </select>
             </div>

             <div className="mr-auto">
               <Badge className="bg-primary/5 text-primary border-none font-black px-4 h-11 flex items-center gap-2">
                  عدد النتائج: {filteredProducts.length}
               </Badge>
             </div>
          </div>

          <div className="nova-card overflow-hidden border-border dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-premium transition-colors">
            <Table>
              <TableHeader className="bg-accent/50 dark:bg-zinc-800/50">
                <TableRow className="border-border dark:border-zinc-800">
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">المنتج</TableHead>
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">المجموعة / القسم</TableHead>
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">السعر</TableHead>
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow><TableCell colSpan={4} className="text-center py-20 font-bold animate-pulse text-primary/20 dark:text-zinc-800">جاري جلب قائمة NOVA...</TableCell></TableRow>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product: any, idx: number) => (
                    <TableRow key={`${product.id}-${idx}`} className="border-border dark:border-zinc-800 hover:bg-accent/20 dark:hover:bg-zinc-800/40 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-12 rounded-lg overflow-hidden border border-border dark:border-zinc-700 flex-shrink-0 bg-accent dark:bg-zinc-800">
                            <Image src={product.images?.[0] || 'https://picsum.photos/seed/placeholder/200/300'} alt={product.name} fill className="object-cover" />
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-primary dark:text-zinc-100">{product.name}</span>
                             <span className="text-[10px] text-primary/30 dark:text-zinc-600 font-mono">SKU: {product.sku || '---'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="border-secondary/20 text-secondary text-[8px] font-black w-fit">{product.mainCategoryName || 'مجموعة عامة'}</Badge>
                          <Badge variant="outline" className="border-primary/10 dark:border-zinc-700 text-primary/60 dark:text-zinc-400 text-[9px] font-bold w-fit">{product.categoryName}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-primary dark:text-zinc-100">{product.price?.toLocaleString()} د.ع</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => copyProductLink(product.id)} 
                            className={cn(
                              "p-2 rounded-lg transition-all shadow-sm",
                              copiedId === product.id ? "bg-green-500 text-white" : "bg-accent dark:bg-zinc-800 text-primary/20 hover:text-primary"
                            )}
                          >
                            {copiedId === product.id ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                          </button>
                          <Link href={`/admin/products/${product.id}`} className="p-2 bg-accent dark:bg-zinc-800 rounded-lg text-primary/20 dark:text-zinc-600 hover:text-primary transition-all">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button onClick={() => toggleStatus(product.id, product.status)} className="p-2 bg-accent dark:bg-zinc-800 rounded-lg text-primary/20 dark:text-zinc-600 hover:text-primary transition-all">
                            {product.status === 'active' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 dark:bg-red-900/10 rounded-lg text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 font-black opacity-20 italic">لا توجد منتجات مطابقة للبحث</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}