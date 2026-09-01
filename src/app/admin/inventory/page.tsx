
"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc, query } from 'firebase/firestore';
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
import { Package, Search, Save, AlertCircle, Filter } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const db = useFirestore();
  const productsQuery = useMemo(() => query(collection(db, 'products')), [db]);
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

  const handleUpdateStock = async (productId: string, variantIndex: number, newStock: number, variants: any[]) => {
    if (newStock < 0) {
      toast({ variant: "destructive", title: "خطأ", description: "لا يمكن أن يكون المخزون سالباً" });
      return;
    }

    try {
      const productRef = doc(db, 'products', productId);
      if (variantIndex === -1) {
        toast({ title: "تنبيه", description: "هذا المنتج لا يحتوي على خيارات متطورة" });
        return;
      }
      
      const updatedVariants = [...variants];
      updatedVariants[variantIndex].stock = newStock;
      
      await updateDoc(productRef, { variants: updatedVariants });
      toast({ title: "تم التحديث", description: "تم تحديث كمية المخزون بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل التحديث", description: "حدث خطأ أثناء تحديث المخزون" });
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black animate-pulse">جاري جرد المخزن الملكي...</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">المستودع</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary">إدارة المخزون</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setFilterLowStock(!filterLowStock)}
                className={cn(
                  "h-12 rounded-2xl border-border font-black gap-2 transition-all shadow-sm",
                  filterLowStock ? "bg-primary text-white" : "bg-white text-primary/40"
                )}
              >
                <Filter className="h-4 w-4" />
                منخفض المخزون
              </Button>
              <div className="relative w-full md:w-80 group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="ابحثي بالمنتج أو SKU..." 
                  className="h-12 pr-12 bg-accent/30 border-border rounded-2xl text-primary font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="nova-card overflow-hidden border-border bg-white shadow-premium">
            <Table>
              <TableHeader className="bg-accent/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-primary/60 font-black text-right">المنتج</TableHead>
                  <TableHead className="text-primary/60 font-black text-right">SKU</TableHead>
                  <TableHead className="text-primary/60 font-black text-right">الخيار</TableHead>
                  <TableHead className="text-primary/60 font-black text-right">الحالة</TableHead>
                  <TableHead className="text-primary/60 font-black text-right">الكمية</TableHead>
                  <TableHead className="text-primary/60 font-black text-right">إجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flattenedInventory.map((item, idx) => (
                  <TableRow key={idx} className="border-border hover:bg-accent/20 transition-colors">
                    <TableCell className="py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{item.productName}</span>
                        <span className="text-[10px] text-primary/30 uppercase font-black">{item.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-primary/40 text-xs font-mono font-bold">{item.sku}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="border-border text-primary font-bold bg-accent/50">{item.color}</Badge>
                        <Badge variant="outline" className="border-border text-primary font-black bg-accent/50">{item.size}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.stock === 0 ? (
                        <Badge className="bg-red-50 text-red-500 border-none font-black text-[10px] animate-pulse">نفد المخزون</Badge>
                      ) : item.stock <= 5 ? (
                        <Badge className="bg-yellow-50 text-yellow-600 border-none font-black text-[10px] flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          منخفض
                        </Badge>
                      ) : (
                        <Badge className="bg-green-50 text-green-600 border-none font-black text-[10px]">متوفر</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        defaultValue={item.stock}
                        className="w-24 h-10 bg-accent/30 border-border text-center font-black text-primary"
                        id={`stock-${item.productId}-${item.variantIndex}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:bg-primary hover:text-white h-10 rounded-xl gap-2 font-black transition-all"
                        onClick={() => {
                          const input = document.getElementById(`stock-${item.productId}-${item.variantIndex}`) as HTMLInputElement;
                          handleUpdateStock(item.productId, item.variantIndex, parseInt(input.value), item.allVariants);
                        }}
                      >
                        <Save className="h-4 w-4" />
                        حفظ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {flattenedInventory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-primary/20 font-bold italic">المستودع فارغ أو لا توجد نتائج</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
