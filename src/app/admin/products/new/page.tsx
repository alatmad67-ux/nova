
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
  Palette
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
  
  const categoriesQuery = useMemo(() => collection(db, 'categories'), [db]);
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
    if (!productData.name || !productData.price || !productData.categoryId) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الاسم والسعر والقسم مطلوبون" });
      return;
    }

    setLoading(true);
    const selectedCat = categories?.find(c => c.id === productData.categoryId);
    
    const finalProduct = {
      ...productData,
      categoryName: selectedCat?.name || '',
      storeId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDoc(collection(db, 'products'), finalProduct)
      .then(() => {
        toast({ title: "تم بنجاح", description: "تمت إضافة المنتج الجديد" });
        router.push('/admin/products');
      })
      .catch(async (error) => {
        setLoading(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'products', operation: 'create' }));
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
              {loading ? "جاري الحفظ..." : "حفظ المنتج"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="nova-card p-10 space-y-8 border-border">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="text-primary h-5 w-5" />
                <h3 className="text-xl font-black text-primary">المعلومات الأساسية والسعر</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase">اسم المنتج *</Label>
                  <Input value={productData.name} onChange={(e) => setProductData({...productData, name: e.target.value})} className="h-12 bg-accent/30 border-border rounded-xl font-bold text-primary" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase">القسم *</Label>
                  <select className="w-full h-12 px-4 bg-accent/30 border border-border rounded-xl text-primary font-bold outline-none" value={productData.categoryId} onChange={(e) => setProductData({...productData, categoryId: e.target.value})}>
                    <option value="">اختر القسم</option>
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase">سعر البيع (د.ع) *</Label>
                  <Input type="number" value={productData.price || ''} onChange={(e) => setProductData({...productData, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})} className="h-12 bg-accent/30 border-border rounded-xl font-black text-primary" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 uppercase">السعر قبل الخصم (اختياري)</Label>
                  <Input type="number" value={productData.originalPrice || ''} onChange={(e) => setProductData({...productData, originalPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)})} className="h-12 bg-accent/30 border-border rounded-xl text-primary/40" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-primary/40 uppercase">وصف المنتج</Label>
                <Textarea value={productData.description} onChange={(e) => setProductData({...productData, description: e.target.value})} className="min-h-[100px] bg-accent/30 border-border rounded-xl text-primary font-medium" />
              </div>
            </div>

            <div className="nova-card p-10 space-y-8 border-border">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="text-primary h-5 w-5" />
                <h3 className="text-xl font-black text-primary">صور المنتج</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {productData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-accent">
                    <Image src={img} alt="Product" fill className="object-cover" />
                    <button onClick={() => setProductData({...productData, images: productData.images.filter((_, i) => i !== idx)})} className="absolute top-2 left-2 p-1 bg-red-500 rounded-full text-white shadow-lg"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
                <ImageUploadButton onUploadComplete={(url) => setProductData({...productData, images: [...productData.images, url]})} className="aspect-[3/4]" label="إضافة صورة" />
              </div>
            </div>

            <div className="nova-card p-10 space-y-8 border-border">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="text-primary h-5 w-5" />
                <h3 className="text-xl font-black text-primary">الألوان والقياسات</h3>
              </div>
              
              <div className="space-y-4">
                <Label className="text-xs font-black text-primary/40 uppercase">الألوان المتاحة</Label>
                <div className="flex flex-wrap gap-3">
                  {productData.colors.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-accent/50 p-2 rounded-xl border border-border">
                      <Input placeholder="اسم اللون" value={c.name} onChange={(e) => {
                        const newColors = [...productData.colors];
                        newColors[idx].name = e.target.value;
                        setProductData({...productData, colors: newColors});
                      }} className="h-8 w-24 bg-transparent border-none text-xs font-bold text-primary" />
                      <Input type="color" value={c.code} onChange={(e) => {
                        const newColors = [...productData.colors];
                        newColors[idx].code = e.target.value;
                        setProductData({...productData, colors: newColors});
                      }} className="h-8 w-8 p-0 bg-transparent border-none cursor-pointer" />
                      <button onClick={() => setProductData({...productData, colors: productData.colors.filter((_, i) => i !== idx)})}><Trash2 className="h-3 w-3 text-red-500" /></button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setProductData({...productData, colors: [...productData.colors, { name: '', code: '#7C3AED' }]})} className="h-10 border-dashed rounded-xl border-primary/20 text-primary/40 hover:bg-primary/5"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black text-primary/40 uppercase">القياسات المتاحة</Label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(s => (
                    <button key={s} onClick={() => {
                      const newSizes = productData.selectedSizes.includes(s) ? productData.selectedSizes.filter(sz => sz !== s) : [...productData.selectedSizes, s];
                      setProductData({...productData, selectedSizes: newSizes});
                    }} className={cn("h-12 w-12 rounded-xl font-black border-2 transition-all", productData.selectedSizes.includes(s) ? "border-primary text-primary bg-primary/10" : "border-accent text-primary/20 bg-accent/30")}>{s}</button>
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
