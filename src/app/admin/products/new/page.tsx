
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Loader2,
  Info,
  ChevronRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useStore } from '@/providers/store-provider';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { ImageUploadButton } from '@/components/ui/image-upload-button';

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function NewProductPage() {
  const router = useRouter();
  const db = useFirestore();
  const { storeId } = useStore();
  const [loading, setLoading] = useState(false);
  
  // جلب المجموعات الكبرى الديناميكية
  const mainCatQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(collection(db, 'main-categories'), where('storeId', '==', storeId));
  }, [db, storeId]);
  const { data: mainCategories } = useCollection(mainCatQuery);

  // جلب كافة الأقسام الفرعية
  const subCatQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(collection(db, 'categories'), where('storeId', '==', storeId));
  }, [db, storeId]);
  const { data: subCategories } = useCollection(subCatQuery);

  const [productData, setProductData] = useState({
    name: '',
    sku: '',
    description: '',
    material: '',
    brand: '',
    ingredients: '',
    howToUse: '',
    specifications: '',
    price: 0,
    originalPrice: 0,
    mainCategory: '',
    categoryId: '',
    categoryName: '',
    images: [] as string[],
    colors: [{ name: '', code: '#7C3AED' }],
    selectedSizes: [] as string[],
    status: 'active',
    isNew: true
  });

  const filteredSubCategories = useMemo(() => {
    return subCategories?.filter((c: any) => c.mainCategory === productData.mainCategory) || [];
  }, [subCategories, productData.mainCategory]);

  const handleSave = () => {
    if (!db) return;
    if (!productData.name || !productData.price || !productData.categoryId) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الاسم والسعر والقسم مطلوبون" });
      return;
    }

    setLoading(true);
    const selectedSub = subCategories?.find((c: any) => c.id === productData.categoryId);
    
    const generatedVariants = [];
    // توليد خيارات تلقائية إذا كانت مجموعة أزياء
    const isFashion = mainCategories?.find(m => m.id === productData.mainCategory)?.slug?.includes('fashion') || productData.mainCategory.includes('fashion');
    
    if (isFashion) {
      for (const color of productData.colors) {
        if (!color.name) continue;
        for (const size of productData.selectedSizes) {
          generatedVariants.push({
            color: color.name,
            colorCode: color.code,
            size: size,
            stock: 10,
            sku: `${productData.sku || 'P'}-${color.name}-${size}`
          });
        }
      }
    }

    const finalProduct = {
      ...productData,
      variants: generatedVariants,
      categoryName: selectedSub?.name || '',
      storeId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDoc(collection(db, 'products'), finalProduct)
      .then(() => {
        toast({ title: "تم الحفظ ✨", description: `تمت إضافة المنتج بنجاح` });
        router.push('/admin/products');
      })
      .catch((error) => {
        setLoading(false);
        toast({ variant: "destructive", title: "خطأ", description: "فشل الاتصال بالفاير ستور" });
      });
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors" dir="rtl">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <button onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary/40 hover:text-primary transition-all">
                <ChevronRight className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-4xl font-black text-primary dark:text-zinc-100">إضافة منتج جديد</h1>
                <p className="text-primary/40 dark:text-zinc-500 text-sm mt-1">توسيع مجموعة NOVA بمنتجات فريدة</p>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="h-14 px-12 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              {loading ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : "حفظ المنتج الملكي"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-10">
            <div className="nova-card p-10 bg-white dark:bg-zinc-900 shadow-premium space-y-10 border border-border dark:border-zinc-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-3">
                   <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">المجموعة الكبرى</Label>
                   <select 
                    className="w-full h-14 px-4 bg-accent/30 dark:bg-zinc-800 rounded-2xl font-bold outline-none border-none dark:text-zinc-100"
                    value={productData.mainCategory}
                    onChange={(e) => setProductData({...productData, mainCategory: e.target.value, categoryId: ''})}
                   >
                     <option value="">اختر المجموعة الكبرى</option>
                     {mainCategories?.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                   </select>
                 </div>
                 <div className="space-y-3 md:col-span-2">
                   <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">القسم الفرعي</Label>
                   <select 
                    className="w-full h-14 px-4 bg-accent/30 dark:bg-zinc-800 rounded-2xl font-bold outline-none border-none dark:text-zinc-100"
                    value={productData.categoryId}
                    onChange={(e) => setProductData({...productData, categoryId: e.target.value})}
                    disabled={!productData.mainCategory}
                   >
                     <option value="">اختر القسم الفرعي</option>
                     {filteredSubCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">اسم المنتج</Label>
                  <Input value={productData.name} onChange={(e) => setProductData({...productData, name: e.target.value})} className="h-14 bg-accent/30 dark:bg-zinc-800 rounded-2xl font-bold border-none dark:text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">الماركة / البراند</Label>
                  <Input value={productData.brand} onChange={(e) => setProductData({...productData, brand: e.target.value})} className="h-14 bg-accent/30 dark:bg-zinc-800 rounded-2xl font-bold border-none dark:text-zinc-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">السعر الحالي (د.ع)</Label>
                  <Input type="number" value={productData.price || ''} onChange={(e) => setProductData({...productData, price: parseFloat(e.target.value) || 0})} className="h-14 bg-accent/30 dark:bg-zinc-800 rounded-2xl font-black text-xl border-none dark:text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">السعر السابق</Label>
                  <Input type="number" value={productData.originalPrice || ''} onChange={(e) => setProductData({...productData, originalPrice: parseFloat(e.target.value) || 0})} className="h-14 bg-accent/30 dark:bg-zinc-800 rounded-2xl text-primary/40 dark:text-zinc-500 font-bold border-none" />
                </div>
              </div>
            </div>

            {/* تفاصيل ديناميكية */}
            <div className="nova-card p-10 bg-white dark:bg-zinc-900 shadow-premium space-y-8 border border-border dark:border-zinc-800">
               <h3 className="text-lg font-black text-primary dark:text-zinc-100 flex items-center gap-2">
                 <Info className="h-5 w-5 text-secondary" />
                 تفاصيل إضافية
               </h3>

               <div className="grid grid-cols-1 gap-8">
                 <div className="space-y-2">
                   <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">خامة القماش / المواد</Label>
                   <Input value={productData.material} onChange={(e) => setProductData({...productData, material: e.target.value})} className="h-12 bg-accent/30 dark:bg-zinc-800 rounded-xl border-none dark:text-zinc-100" />
                 </div>
                 <div className="space-y-4">
                   <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">الألوان المتوفرة</Label>
                   <div className="flex flex-wrap gap-4">
                     {productData.colors.map((c, idx) => (
                       <div key={idx} className="flex items-center gap-2 bg-accent dark:bg-zinc-800 p-2 rounded-xl border border-transparent dark:border-zinc-700 transition-colors">
                         <input type="color" value={c.code} onChange={(e) => {
                           const colors = [...productData.colors];
                           colors[idx].code = e.target.value;
                           setProductData({...productData, colors});
                         }} className="h-8 w-8 rounded-lg overflow-hidden border-none cursor-pointer" />
                         <input placeholder="اللون" value={c.name} onChange={(e) => {
                           const colors = [...productData.colors];
                           colors[idx].name = e.target.value;
                           setProductData({...productData, colors});
                         }} className="bg-transparent border-none w-24 text-xs font-bold dark:text-zinc-100 outline-none" />
                         <button onClick={() => setProductData({...productData, colors: productData.colors.filter((_, i) => i !== idx)})} className="text-red-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                       </div>
                     ))}
                     <Button variant="outline" onClick={() => setProductData({...productData, colors: [...productData.colors, {name:'', code: '#000000'}]})} className="h-12 w-12 border-dashed border-primary/20 dark:border-zinc-700 rounded-xl">+</Button>
                   </div>
                 </div>
                 <div className="space-y-4">
                   <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">القياسات</Label>
                   <div className="flex flex-wrap gap-2">
                     {SIZES.map(s => (
                       <button key={s} onClick={() => {
                         const sizes = productData.selectedSizes.includes(s) ? productData.selectedSizes.filter(sz => sz !== s) : [...productData.selectedSizes, s];
                         setProductData({...productData, selectedSizes: sizes});
                       }} className={cn("h-10 w-12 rounded-lg font-black text-xs border-2 transition-all", productData.selectedSizes.includes(s) ? "border-primary bg-primary text-white" : "border-accent dark:border-zinc-800 bg-white dark:bg-zinc-900 text-primary/40 dark:text-zinc-500")}>{s}</button>
                     ))}
                   </div>
                 </div>
               </div>

               <div className="space-y-2 pt-4">
                 <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">وصف المنتج العام</Label>
                 <Textarea value={productData.description} onChange={(e) => setProductData({...productData, description: e.target.value})} className="min-h-[150px] bg-accent/30 dark:bg-zinc-800 rounded-2xl p-6 border-none dark:text-zinc-300" />
               </div>
            </div>

            <div className="nova-card p-10 bg-white dark:bg-zinc-900 shadow-premium space-y-8 border border-border dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="text-primary dark:text-zinc-100 h-5 w-5" />
                <h3 className="text-xl font-black text-primary dark:text-zinc-100">صور المنتج</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {productData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-accent dark:border-zinc-800 group">
                    <Image src={img} alt="Product" fill className="object-cover" />
                    <button 
                      onClick={() => setProductData({...productData, images: productData.images.filter((_, i) => i !== idx)})} 
                      className="absolute top-2 left-2 p-2 bg-red-500 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <ImageUploadButton 
                  onUploadComplete={(url) => setProductData({...productData, images: [...productData.images, url]})} 
                  className="aspect-[3/4]" 
                  label="إضافة صورة" 
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
