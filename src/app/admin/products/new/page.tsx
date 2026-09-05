
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
  Tag, 
  Palette,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useStore } from '@/providers/store-provider';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { ImageUploadButton } from '@/components/ui/image-upload-button';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function NewProductPage() {
  const router = useRouter();
  const db = useFirestore();
  const { storeId } = useStore();
  const [loading, setLoading] = useState(false);
  
  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);

  const { data: categories } = useCollection(categoriesQuery);

  const [productData, setProductData] = useState({
    name: '',
    sku: '',
    description: '',
    material: '',
    price: 0,
    originalPrice: 0,
    categoryId: '',
    categoryName: '',
    images: [] as string[],
    colors: [{ name: '', code: '#7C3AED' }],
    selectedSizes: [] as string[],
    variants: [] as any[],
    status: 'active',
    isNew: true
  });

  const handleSave = () => {
    if (!db) return;
    if (!productData.name || !productData.price || !productData.categoryId) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الاسم والسعر والقسم مطلوبون" });
      return;
    }

    if (productData.images.length === 0) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى إضافة صورة واحدة على الأقل للمنتج" });
      return;
    }

    setLoading(true);
    const selectedCat = categories?.find(c => c.id === productData.categoryId);
    
    // توليد الـ variants بناءً على الألوان والقياسات المختارة
    const generatedVariants = [];
    for (const color of productData.colors) {
      if (!color.name) continue;
      for (const size of productData.selectedSizes) {
        generatedVariants.push({
          color: color.name,
          colorCode: color.code,
          size: size,
          stock: 10, // قيمة افتراضية
          sku: `${productData.sku || 'P'}-${color.name}-${size}`
        });
      }
    }

    const finalProduct = {
      ...productData,
      variants: generatedVariants,
      categoryName: selectedCat?.name || '',
      storeId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDoc(collection(db, 'products'), finalProduct)
      .then(() => {
        toast({ title: "تم بنجاح ✨", description: `تمت إضافة منتج ${productData.name} لمجموعة NOVA` });
        router.push('/admin/products');
      })
      .catch(async (error) => {
        console.error("Product Save Error:", error);
        setLoading(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'products', operation: 'create' }));
        toast({ variant: "destructive", title: "فشل الحفظ", description: "حدث خطأ أثناء الاتصال بالفاير ستور" });
      });
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-black text-primary">إضافة منتج جديد</h1>
              <p className="text-primary/40 text-sm mt-1">أدخلي تفاصيل القطعة الجديدة في مجموعة NOVA</p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="h-14 px-12 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : "حفظ المنتج"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Basic Info */}
            <div className="nova-card p-10 space-y-8 border-border">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="text-primary h-5 w-5" />
                <h3 className="text-xl font-black text-primary">المعلومات الأساسية والسعر</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">اسم المنتج *</Label>
                  <Input 
                    value={productData.name} 
                    onChange={(e) => setProductData({...productData, name: e.target.value})} 
                    className="h-14 bg-accent/30 border-border rounded-2xl font-bold text-primary" 
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">القسم *</Label>
                  <select 
                    className="w-full h-14 px-4 bg-accent/30 border border-border rounded-2xl text-primary font-bold outline-none appearance-none cursor-pointer" 
                    value={productData.categoryId} 
                    onChange={(e) => setProductData({...productData, categoryId: e.target.value})}
                    disabled={loading}
                  >
                    <option value="">اختر القسم</option>
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">سعر البيع (د.ع) *</Label>
                  <Input 
                    type="number" 
                    value={productData.price || ''} 
                    onChange={(e) => setProductData({...productData, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})} 
                    className="h-14 bg-accent/30 border-border rounded-2xl font-black text-primary" 
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">السعر قبل الخصم</Label>
                  <Input 
                    type="number" 
                    value={productData.originalPrice || ''} 
                    onChange={(e) => setProductData({...productData, originalPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)})} 
                    className="h-14 bg-accent/30 border-border rounded-2xl text-primary/40" 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">وصف المنتج</Label>
                <Textarea 
                  value={productData.description} 
                  onChange={(e) => setProductData({...productData, description: e.target.value})} 
                  className="min-h-[150px] bg-accent/30 border-border rounded-3xl p-6 text-primary font-medium" 
                  disabled={loading}
                />
              </div>
            </div>

            {/* Images */}
            <div className="nova-card p-10 space-y-8 border-border">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="text-primary h-5 w-5" />
                <h3 className="text-xl font-black text-primary">صور المنتج</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {productData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-accent bg-accent group shadow-sm">
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

            {/* Options */}
            <div className="nova-card p-10 space-y-8 border-border">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="text-primary h-5 w-5" />
                <h3 className="text-xl font-black text-primary">الألوان والقياسات</h3>
              </div>
              
              <div className="space-y-6">
                <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">الألوان المتاحة</Label>
                <div className="flex flex-wrap gap-4">
                  {productData.colors.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-accent/50 p-3 rounded-2xl border border-border">
                      <Input placeholder="اسم اللون" value={c.name} onChange={(e) => {
                        const newColors = [...productData.colors];
                        newColors[idx].name = e.target.value;
                        setProductData({...productData, colors: newColors});
                      }} className="h-10 w-32 bg-transparent border-none text-sm font-bold text-primary" />
                      <Input type="color" value={c.code} onChange={(e) => {
                        const newColors = [...productData.colors];
                        newColors[idx].code = e.target.value;
                        setProductData({...productData, colors: newColors});
                      }} className="h-10 w-10 p-0 bg-transparent border-none cursor-pointer rounded-full overflow-hidden" />
                      <button onClick={() => setProductData({...productData, colors: productData.colors.filter((_, i) => i !== idx)})} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => setProductData({...productData, colors: [...productData.colors, { name: '', code: '#7C3AED' }]})} className="h-14 w-14 border-dashed rounded-2xl border-primary/20 text-primary/40 hover:bg-primary/5"><Plus className="h-6 w-6" /></Button>
                </div>
              </div>

              <div className="space-y-6">
                <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">القياسات المتاحة</Label>
                <div className="flex flex-wrap gap-3">
                  {SIZES.map(s => (
                    <button key={s} onClick={() => {
                      const newSizes = productData.selectedSizes.includes(s) ? productData.selectedSizes.filter(sz => sz !== s) : [...productData.selectedSizes, s];
                      setProductData({...productData, selectedSizes: newSizes});
                    }} className={cn("h-14 w-14 rounded-2xl font-black border-2 transition-all shadow-sm", productData.selectedSizes.includes(s) ? "border-primary text-primary bg-primary/5" : "border-border text-primary/20 bg-white")}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
