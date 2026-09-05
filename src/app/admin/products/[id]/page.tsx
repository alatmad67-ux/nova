
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import { doc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
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
const MAIN_CATEGORIES = [
  { id: 'fashion', name: 'الأزياء' },
  { id: 'accessories', name: 'الأكسسوارات' },
  { id: 'skincare', name: 'العناية بالبشرة' },
  { id: 'beauty-devices', name: 'أجهزة العناية' },
];

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const db = useFirestore();
  const { storeId } = useStore();
  const [loading, setLoading] = useState(false);
  
  const productRef = useMemo(() => (db && id) ? doc(db, 'products', id as string) : null, [db, id]);
  const { data: product, loading: productLoading } = useDoc(productRef);

  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const [productData, setProductData] = useState<any>({
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
    mainCategory: 'fashion',
    categoryId: '',
    categoryName: '',
    images: [] as string[],
    colors: [{ name: '', code: '#7C3AED' }],
    selectedSizes: [] as string[],
    status: 'active'
  });

  useEffect(() => {
    if (product) {
      setProductData({
        ...productData,
        ...product,
        // Ensure some fields are properly initialized
        images: product.images || [],
        colors: product.colors || [{ name: '', code: '#7C3AED' }],
        selectedSizes: product.selectedSizes || []
      });
    }
  }, [product]);

  const filteredCategories = useMemo(() => {
    return categories?.filter(c => c.mainCategory === productData.mainCategory) || [];
  }, [categories, productData.mainCategory]);

  const handleUpdate = () => {
    if (!db || !productRef) return;
    if (!productData.name || !productData.price || !productData.categoryId) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الاسم والسعر والقسم مطلوبون" });
      return;
    }

    setLoading(true);
    const selectedCat = categories?.find(c => c.id === productData.categoryId);
    
    // Logic for fashion variants if main category is fashion and something changed
    const generatedVariants = productData.mainCategory === 'fashion' ? [] : (product.variants || []);
    if (productData.mainCategory === 'fashion') {
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
      variants: generatedVariants.length > 0 ? generatedVariants : (product.variants || []),
      categoryName: selectedCat?.name || productData.categoryName,
      updatedAt: serverTimestamp(),
    };

    updateDoc(productRef, finalProduct)
      .then(() => {
        toast({ title: "تم التحديث ✨", description: `تم حفظ تعديلات المنتج بنجاح` });
        router.push('/admin/products');
      })
      .catch((error) => {
        setLoading(false);
        toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث المنتج في الفاير ستور" });
      });
  };

  if (productLoading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse text-primary">جاري تحميل بيانات المنتج...</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
              <button onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-primary/40 hover:text-primary transition-all">
                <ChevronRight className="h-6 w-6 rotate-180" />
              </button>
              <div>
                <h1 className="text-4xl font-black text-primary">تعديل المنتج</h1>
                <p className="text-primary/40 text-sm mt-1">تحديث بيانات قطعة NOVA الحالية</p>
              </div>
            </div>
            <Button 
              onClick={handleUpdate} 
              disabled={loading}
              className="h-14 px-12 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              {loading ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : "حفظ التعديلات الملكية"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {/* Main Info */}
            <div className="nova-card p-10 bg-white shadow-premium space-y-10 border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-3">
                   <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">القسم الرئيسي</Label>
                   <select 
                    className="w-full h-14 px-4 bg-accent/30 rounded-2xl font-bold outline-none"
                    value={productData.mainCategory}
                    onChange={(e) => setProductData({...productData, mainCategory: e.target.value, categoryId: ''})}
                   >
                     {MAIN_CATEGORIES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                   </select>
                 </div>
                 <div className="space-y-3 md:col-span-2">
                   <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">القسم الفرعي</Label>
                   <select 
                    className="w-full h-14 px-4 bg-accent/30 rounded-2xl font-bold outline-none"
                    value={productData.categoryId}
                    onChange={(e) => setProductData({...productData, categoryId: e.target.value})}
                   >
                     <option value="">اختر القسم الفرعي</option>
                     {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase">اسم المنتج</Label>
                  <Input value={productData.name} onChange={(e) => setProductData({...productData, name: e.target.value})} className="h-14 bg-accent/30 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase">الماركة / البراند</Label>
                  <Input value={productData.brand} onChange={(e) => setProductData({...productData, brand: e.target.value})} className="h-14 bg-accent/30 rounded-2xl font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase">السعر الحالي (د.ع)</Label>
                  <Input type="number" value={productData.price} onChange={(e) => setProductData({...productData, price: parseFloat(e.target.value) || 0})} className="h-14 bg-accent/30 rounded-2xl font-black text-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase">السعر السابق</Label>
                  <Input type="number" value={productData.originalPrice} onChange={(e) => setProductData({...productData, originalPrice: parseFloat(e.target.value) || 0})} className="h-14 bg-accent/30 rounded-2xl text-primary/40 font-bold" />
                </div>
              </div>
            </div>

            {/* Dynamic Details */}
            <div className="nova-card p-10 bg-white shadow-premium space-y-8 border-border">
               <h3 className="text-lg font-black text-primary flex items-center gap-2">
                 <Info className="h-5 w-5 text-secondary" />
                 تفاصيل إضافية
               </h3>

               {productData.mainCategory === 'fashion' && (
                 <div className="grid grid-cols-1 gap-8">
                   <div className="space-y-2">
                     <Label className="text-xs font-black text-primary/40 uppercase">خامة القماش</Label>
                     <Input value={productData.material} onChange={(e) => setProductData({...productData, material: e.target.value})} className="h-12 bg-accent/30 rounded-xl" />
                   </div>
                   <div className="space-y-4">
                     <Label className="text-xs font-black text-primary/40 uppercase">الألوان المتوفرة</Label>
                     <div className="flex flex-wrap gap-4">
                       {productData.colors?.map((c: any, idx: number) => (
                         <div key={idx} className="flex items-center gap-2 bg-accent p-2 rounded-xl">
                           <input type="color" value={c.code} onChange={(e) => {
                             const colors = [...productData.colors];
                             colors[idx].code = e.target.value;
                             setProductData({...productData, colors});
                           }} className="h-8 w-8 rounded-lg overflow-hidden border-none" />
                           <input placeholder="اسم اللون" value={c.name} onChange={(e) => {
                             const colors = [...productData.colors];
                             colors[idx].name = e.target.value;
                             setProductData({...productData, colors});
                           }} className="bg-transparent border-none w-24 text-xs font-bold" />
                           <button onClick={() => setProductData({...productData, colors: productData.colors.filter((_: any, i: number) => i !== idx)})} className="text-red-400"><Trash2 className="h-4 w-4" /></button>
                         </div>
                       ))}
                       <Button variant="outline" onClick={() => setProductData({...productData, colors: [...productData.colors, {name:'', code: '#000000'}]})} className="h-12 w-12 border-dashed rounded-xl">+</Button>
                     </div>
                   </div>
                   <div className="space-y-4">
                     <Label className="text-xs font-black text-primary/40 uppercase">القياسات المختارة</Label>
                     <div className="flex flex-wrap gap-2">
                       {SIZES.map(s => (
                         <button key={s} onClick={() => {
                           const sizes = productData.selectedSizes.includes(s) ? productData.selectedSizes.filter((sz: any) => sz !== s) : [...productData.selectedSizes, s];
                           setProductData({...productData, selectedSizes: sizes});
                         }} className={cn("h-10 w-12 rounded-lg font-black text-xs border-2 transition-all", productData.selectedSizes?.includes(s) ? "border-primary bg-primary text-white" : "border-accent text-primary/40")}>{s}</button>
                       ))}
                     </div>
                   </div>
                 </div>
               )}

               {productData.mainCategory === 'skincare' && (
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-primary/40 uppercase">المكونات الرئيسية</Label>
                      <Textarea value={productData.ingredients} onChange={(e) => setProductData({...productData, ingredients: e.target.value})} className="bg-accent/30 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-primary/40 uppercase">طريقة الاستخدام</Label>
                      <Textarea value={productData.howToUse} onChange={(e) => setProductData({...productData, howToUse: e.target.value})} className="bg-accent/30 rounded-xl" />
                    </div>
                 </div>
               )}

               {productData.mainCategory === 'beauty-devices' && (
                 <div className="space-y-2">
                   <Label className="text-xs font-black text-primary/40 uppercase">المواصفات التقنية</Label>
                   <Textarea value={productData.specifications} onChange={(e) => setProductData({...productData, specifications: e.target.value})} className="bg-accent/30 rounded-xl" />
                 </div>
               )}

               <div className="space-y-2 pt-4">
                 <Label className="text-xs font-black text-primary/40 uppercase">وصف المنتج العام</Label>
                 <Textarea value={productData.description} onChange={(e) => setProductData({...productData, description: e.target.value})} className="min-h-[150px] bg-accent/30 rounded-2xl p-6" />
               </div>
            </div>

            {/* Images */}
            <div className="nova-card p-10 bg-white shadow-premium space-y-8 border-border">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="text-primary h-5 w-5" />
                <h3 className="text-xl font-black text-primary">صور المنتج</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {productData.images?.map((img: string, idx: number) => (
                  <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-accent bg-accent group shadow-sm">
                    <Image src={img} alt="Product" fill className="object-cover" />
                    <button 
                      onClick={() => setProductData({...productData, images: productData.images.filter((_: any, i: number) => i !== idx)})} 
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
