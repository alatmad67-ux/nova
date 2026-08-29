
"use client";

import React, { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
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
import { Package, Search, AlertTriangle, Save, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const db = useFirestore();
  const productsQuery = useMemo(() => collection(db, 'products'), [db]);
  const { data: products, loading } = useCollection(productsQuery);
  const [searchTerm, setSearchTerm] = useState('');

  const flattenedInventory = useMemo(() => {
    if (!products) return [];
    const items: any[] = [];
    products.forEach((p: any) => {
      p.variants?.forEach((v: any, vIdx: number) => {
        items.push({
          productId: p.id,
          productName: p.name,
          variantIndex: vIdx,
          sku: v.sku,
          color: v.color,
          size: v.size,
          stock: v.stock,
          allVariants: p.variants
        });
      });
    });
    return items.filter(i => 
      i.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleUpdateStock = async (productId: string, variantIndex: number, newStock: number, variants: any[]) => {
    if (newStock < 0) {
      toast({ variant: "destructive", title: "خطأ", description: "لا يمكن أن يكون المخزون سالباً" });
      return;
    }

    try {
      const productRef = doc(db, 'products', productId);
      const updatedVariants = [...variants];
      updatedVariants[variantIndex].stock = newStock;
      
      await updateDoc(productRef, { variants: updatedVariants });
      toast({ title: "تم التحديث", description: "تم تحديث كمية المخزون بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل التحديث", description: "حدث خطأ أثناء تحديث المخزون" });
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري تحميل المخزون...</div>;

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
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="ابحث بالمنتج أو SKU..." 
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
                <TableHead className="text-white/60 font-black text-right">المنتج</TableHead>
                <TableHead className="text-white/60 font-black text-right">SKU</TableHead>
                <TableHead className="text-white/60 font-black text-right">اللون</TableHead>
                <TableHead className="text-white/60 font-black text-right">القياس</TableHead>
                <TableHead className="text-white/60 font-black text-right">الحالة</TableHead>
                <TableHead className="text-white/60 font-black text-right">الكمية الحالية</TableHead>
                <TableHead className="text-white/60 font-black text-right">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flattenedInventory.map((item, idx) => (
                <TableRow key={idx} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-bold text-white">{item.productName}</TableCell>
                  <TableCell className="text-white/40 text-xs font-mono">{item.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/10 text-white/60 font-bold">{item.color}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/10 text-white/60 font-black">{item.size}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.stock === 0 ? (
                      <Badge className="bg-red-500/20 text-red-500 border-none font-black text-[10px]">نفد المخزون</Badge>
                    ) : item.stock <= 5 ? (
                      <Badge className="bg-yellow-500/20 text-yellow-500 border-none font-black text-[10px]">منخفض</Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-500 border-none font-black text-[10px]">متوفر</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number"
                        defaultValue={item.stock}
                        className="w-20 h-9 bg-white/5 border-white/10 text-center font-black"
                        id={`stock-${item.productId}-${item.variantIndex}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm"
                      variant="ghost"
                      className="text-primary hover:bg-primary/10 hover:text-primary h-9 rounded-xl gap-2 font-black"
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
                  <TableCell colSpan={7} className="text-center py-20 text-white/20 font-bold">لا توجد نتائج مطابقة</TableCell>
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
