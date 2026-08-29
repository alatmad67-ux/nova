
"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc, query, orderBy } from 'firebase/firestore';
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
import { Badge } from "@/components/ui/badge";
import { toast } from '@/hooks/use-toast';
import { Package, Search, Save, AlertCircle, Filter } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const db = useFirestore();
  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('createdAt', 'desc')), [db]);
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
        // Fallback for old products without variants
        items.push({
          productId: p.id,
          productName: p.name,
          variantIndex: -1,
          sku: p.sku || 'N/A',
          color: 'عام',
          size: 'واحد',
          stock: p.price ? 0 : 0, // Mocked for safety
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
        // Handle products without variants if needed
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري جرد المخزن الملكي...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">المستودع</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black gold-text">إدارة المخزون</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setFilterLowStock(!filterLowStock)}
              className={cn(
                "h-12 rounded-2xl border-white/10 font-black gap-2 transition-all",
                filterLowStock ? "bg-primary text-black" : "bg-white/5 text-white/40"
              )}
            >
              <Filter className="h-4 w-4" />
              منخفض المخزون
            </Button>
            <div className="relative w-full md:w-80 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="ابحثي بالمنتج أو SKU..." 
                className="h-12 pr-12 bg-white/5 border-white/10 rounded-2xl text-white font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="nova-card overflow-hidden border border-white/5 bg-white/5 backdrop-blur-xl">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/60 font-black text-right">المنتج</TableHead>
                <TableHead className="text-white/60 font-black text-right">SKU</TableHead>
                <TableHead className="text-white/60 font-black text-right">الخيار</TableHead>
                <TableHead className="text-white/60 font-black text-right">الحالة</TableHead>
                <TableHead className="text-white/60 font-black text-right">الكمية</TableHead>
                <TableHead className="text-white/60 font-black text-right">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flattenedInventory.map((item, idx) => (
                <TableRow key={idx} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{item.productName}</span>
                      <span className="text-[10px] text-white/30 uppercase">{item.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/40 text-xs font-mono">{item.sku}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="border-white/10 text-white/60 font-bold">{item.color}</Badge>
                      <Badge variant="outline" className="border-white/10 text-white/60 font-black">{item.size}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.stock === 0 ? (
                      <Badge className="bg-red-500/20 text-red-500 border-none font-black text-[10px] animate-pulse">نفد المخزون</Badge>
                    ) : item.stock <= 5 ? (
                      <Badge className="bg-yellow-500/20 text-yellow-500 border-none font-black text-[10px] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        منخفض
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-500 border-none font-black text-[10px]">متوفر</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      defaultValue={item.stock}
                      className="w-24 h-10 bg-white/5 border-white/10 text-center font-black"
                      id={`stock-${item.productId}-${item.variantIndex}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm"
                      variant="ghost"
                      className="text-primary hover:bg-primary/10 hover:text-primary h-10 rounded-xl gap-2 font-black"
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
                  <TableCell colSpan={6} className="text-center py-20 text-white/20 font-bold">المستودع فارغ أو لا توجد نتائج</TableCell>
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
