
"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc, query, where } from 'firebase/firestore';
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
import { Badge } from "@/components/ui/badge";
import { toast } from '@/hooks/use-toast';
import { 
  Package, 
  Search, 
  Save, 
  AlertCircle, 
  Filter, 
  Loader2, 
  Pencil, 
  Link as LinkIcon, 
  Check 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useStore } from '@/providers/store-provider';
import Link from 'next/link';

export default function InventoryPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const productsQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'products'),
      where('storeId', '==', storeId)
    );
  }, [db, storeId]);

  const { data: products, loading } = useCollection(productsQuery);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const flattenedInventory = useMemo(() => {
    if (!products) return [];
    const items: any[] = [];
    products.forEach((p: any) => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v: any, vIdx: number) => {
          items.push({
            productId: p.id,
            productName: p.name,
            variantIndex: vIdx,
            sku: v.sku || p.sku || 'N/A',
            color: v.color,
            size: v.size,
            stock: v.stock || 0,
            allVariants: p.variants,
            category: p.categoryName
          });
        });
      } else {
        items.push({
          productId: p.id,
          productName: p.name,
          variantIndex: -1,
          sku: p.sku || 'N/A',
          color: 'عام',
          size: 'واحد',
          stock: 0,
          allVariants: [],
          category: p.categoryName
        });
      }
    });
    
    return items.filter(i => {
      const matchesSearch = i.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           i.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterLowStock ? i.stock <= 5 : true;
      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, filterLowStock]);

  const handleUpdateStock = (productId: string, variantIndex: number, newStock: number, variants: any[]) => {
    if (!db) return;
    if (newStock < 0) {
      toast({ variant: "destructive", title: "خطأ", description: "لا يمكن أن يكون المخزون سالباً" });
      return;
    }

    const uniqueId = `${productId}-${variantIndex}`;
    setUpdatingId(uniqueId);

    const productRef = doc(db, 'products', productId);
    if (variantIndex === -1) {
      toast({ title: "تنبيه", description: "هذا المنتج لا يحتوي على خيارات متطورة" });
      setUpdatingId(null);
      return;
    }
    
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].stock = newStock;
    
    updateDoc(productRef, { variants: updatedVariants })
      .then(() => {
        toast({ title: "تم التحديث", description: "تم تحديث كمية المخزون في الفاير ستور" });
      })
      .catch((err) => {
        console.error(err);
        toast({ variant: "destructive", title: "فشل التحديث", description: "تأكدي من الاتصال بالإنترنت" });
      })
      .finally(() => setUpdatingId(null));
  };

  const copyProductLink = (id: string) => {
    const link = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast({ title: "تم نسخ الرابط" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="min-h-screen bg-background dark:bg-[#050505] flex items-center justify-center text-primary dark:text-zinc-100 font-black animate-pulse">جاري جرد المخزن الملكي...</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors" dir="rtl">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary dark:text-zinc-500">المستودع</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary dark:text-zinc-100">إدارة المخزون</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setFilterLowStock(!filterLowStock)}
                className={cn(
                  "h-12 rounded-2xl border-border dark:border-zinc-800 font-black gap-2 transition-all shadow-sm",
                  filterLowStock ? "bg-primary text-white" : "bg-white dark:bg-zinc-900 text-primary/40 dark:text-zinc-500"
                )}
              >
                <Filter className="h-4 w-4" />
                منخفض المخزون
              </Button>
              <div className="relative w-full md:w-80 group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 dark:text-zinc-600 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="ابحثي بالمنتج أو SKU..." 
                  className="h-12 pr-12 bg-accent/30 dark:bg-zinc-800 border-none dark:border-zinc-700 rounded-2xl text-primary dark:text-zinc-100 font-bold focus:ring-2 focus:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="nova-card overflow-hidden border border-border dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-premium transition-colors">
            <Table>
              <TableHeader className="bg-accent/50 dark:bg-zinc-800/50">
                <TableRow className="border-border dark:border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">المنتج</TableHead>
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">SKU</TableHead>
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">الخيار</TableHead>
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">الحالة</TableHead>
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-right">الكمية</TableHead>
                  <TableHead className="text-primary/60 dark:text-zinc-500 font-black text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flattenedInventory.map((item, idx) => {
                  const uniqueId = `${item.productId}-${item.variantIndex}`;
                  const isUpdating = updatingId === uniqueId;
                  const isCopied = copiedId === item.productId;

                  return (
                    <TableRow key={idx} className="border-border dark:border-zinc-800 hover:bg-accent/20 dark:hover:bg-zinc-800/40 transition-colors">
                      <TableCell className="py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary dark:text-zinc-100">{item.productName}</span>
                          <span className="text-[10px] text-primary/30 dark:text-zinc-500 uppercase font-black">{item.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-primary/40 dark:text-zinc-500 text-xs font-mono font-bold">{item.sku}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="border-border dark:border-zinc-700 text-primary dark:text-zinc-300 font-bold bg-accent/50 dark:bg-zinc-800">{item.color}</Badge>
                          <Badge variant="outline" className="border-border dark:border-zinc-700 text-primary dark:text-zinc-300 font-black bg-accent/50 dark:bg-zinc-800">{item.size}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.stock === 0 ? (
                          <Badge className="bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 border-none font-black text-[10px] animate-pulse">نفد المخزون</Badge>
                        ) : item.stock <= 5 ? (
                          <Badge className="bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400 border-none font-black text-[10px] flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            منخفض
                          </Badge>
                        ) : (
                          <Badge className="bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-none font-black text-[10px]">متوفر</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          defaultValue={item.stock}
                          className="w-24 h-10 bg-accent/30 dark:bg-zinc-800 border-none text-center font-black text-primary dark:text-zinc-100 transition-colors"
                          id={`stock-${item.productId}-${item.variantIndex}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          {/* زر نسخ الرابط */}
                          <button 
                            onClick={() => copyProductLink(item.productId)} 
                            className={cn(
                              "p-2 rounded-lg transition-all shadow-sm",
                              isCopied ? "bg-green-500 text-white" : "bg-accent dark:bg-zinc-800 text-primary/20 hover:text-primary"
                            )}
                            title="نسخ رابط المنتج"
                          >
                            {isCopied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                          </button>

                          {/* زر التعديل */}
                          <Link 
                            href={`/admin/products/${item.productId}`}
                            className="p-2 bg-accent dark:bg-zinc-800 rounded-lg text-primary/20 dark:text-zinc-600 hover:text-primary transition-all shadow-sm"
                            title="تعديل المنتج"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>

                          {/* زر حفظ الكمية */}
                          <Button 
                            size="sm"
                            variant="ghost"
                            disabled={isUpdating}
                            className="text-primary dark:text-zinc-400 hover:bg-primary hover:text-white h-10 rounded-xl gap-2 font-black transition-all min-w-[70px]"
                            onClick={() => {
                              const input = document.getElementById(`stock-${item.productId}-${item.variantIndex}`) as HTMLInputElement;
                              handleUpdateStock(item.productId, item.variantIndex, parseInt(input.value), item.allVariants);
                            }}
                          >
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isUpdating ? "" : "حفظ"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
