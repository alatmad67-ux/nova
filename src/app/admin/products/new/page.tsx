
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Tag, 
  Sparkles,
  ChevronRight,
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
    colors: [{ name: '', code: '#000000' }],
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
    <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
      <AdminHeader />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black gold-text">إضافة منتج جديد</h1>
            <p className="text-white/40 text-sm mt-1">أدخلي تفاصيل القطعة الجديدة في مجموعة NOVA</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="h-14 px-12 rounded-2xl bg-primary text-black font-black hover:scale-105 transition-all shadow-xl shadow-primary/20"
          >
            {loading ? "جاري الحفظ..." : "حفظ المنتج"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Section 1: Basic & Pricing */}
          <div className="nova-card p-10 space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="text-primary h-5 w-5" />
              <h3 className="text-xl font-black">المعلومات الأساسية والسعر</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-xs font-black text-white/40 uppercase">اسم المنتج *</Label>
                <Input value={productData.name} onChange={(e) => setProductData({...productData, name: e.target.value})} className="h-12 bg-white/5 border-white/10 rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-white/40 uppercase">القسم *</Label>
                <select className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none" value={productData.categoryId} onChange={(e) => setProductData({...productData, categoryId: e.target.value})}>
                  <option value="">اختر القسم</option>
                  {categories?.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-xs font-black text-white/40 uppercase">سعر البيع (د.ع) *</Label>
                <Input type="number" value={productData.price} onChange={(e) => setProductData({...productData, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})} className="h-12 bg-white/5 border-white/10 rounded-xl font-black text-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-white/40 uppercase">السعر قبل الخصم (اختياري)</Label>
                <Input type="number" value={productData.originalPrice} onChange={(e) => setProductData({...productData, originalPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)})} className="h-12 bg-white/5 border-white/10 rounded-xl text-white/40" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black text-white/40 uppercase">وصف المنتج</Label>
              <Textarea value={productData.description} onChange={(e) => setProductData({...productData, description: e.target.value})} className="min-h-[100px] bg-white/5 border-white/10 rounded-xl" />
            </div>
          </div>

          {/* Section 2: Images */}
          <div className="nova-card p-10 space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="text-primary h-5 w-5" />
              <h3 className="text-xl font-black">صور المنتج</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {productData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
                  <Image src={img} alt="Product" fill className="object-cover" />
                  <button onClick={() => setProductData({...productData, images: productData.images.filter((_, i) => i !== idx)})} className="absolute top-2 left-2 p-1 bg-red-500 rounded-full text-white"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
              <ImageUploadButton onUploadComplete={(url) => setProductData({...productData, images: [...productData.images, url]})} className="aspect-[3/4]" label="إضافة صورة" />
            </div>
          </div>

          {/* Section 3: Colors & Sizes */}
          <div className="nova-card p-10 space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="text-primary h-5 w-5" />
              <h3 className="text-xl font-black">الألوان والقياسات</h3>
            </div>
            
            <div className="space-y-4">
              <Label className="text-xs font-black text-white/40 uppercase">الألوان المتاحة</Label>
              <div className="flex flex-wrap gap-3">
                {productData.colors.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                    <Input placeholder="اسم اللون" value={c.name} onChange={(e) => {
                      const newColors = [...productData.colors];
                      newColors[idx].name = e.target.value;
                      setProductData({...productData, colors: newColors});
                    }} className="h-8 w-24 bg-transparent border-none text-xs font-bold" />
                    <Input type="color" value={c.code} onChange={(e) => {
                      const newColors = [...productData.colors];
                      newColors[idx].code = e.target.value;
                      setProductData({...productData, colors: newColors});
                    }} className="h-8 w-8 p-0 bg-transparent border-none cursor-pointer" />
                    <button onClick={() => setProductData({...productData, colors: productData.colors.filter((_, i) => i !== idx)})}><Trash2 className="h-3 w-3 text-red-400" /></button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setProductData({...productData, colors: [...productData.colors, { name: '', code: '#000000' }]})} className="h-10 border-dashed rounded-xl border-white/20 text-white/40"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-black text-white/40 uppercase">القياسات المتاحة</Label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(s => (
                  <button key={s} onClick={() => {
                    const newSizes = productData.selectedSizes.includes(s) ? productData.selectedSizes.filter(sz => sz !== s) : [...productData.selectedSizes, s];
                    setProductData({...productData, selectedSizes: newSizes});
                  }} className={cn("h-12 w-12 rounded-xl font-black border-2 transition-all", productData.selectedSizes.includes(s) ? "border-primary text-primary bg-primary/10" : "border-white/5 text-white/20 bg-white/5")}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
