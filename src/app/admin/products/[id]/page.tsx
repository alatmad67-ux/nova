
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
  ChevronRight,
  Copy,
  Check,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useStore } from '@/providers/store-provider';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { ImageUploadButton } from '@/components/ui/image-upload-button';

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const db = useFirestore();
  const { storeId } = useStore();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
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
        images: product.images || [],
        colors: product.colors || [{ name: '', code: '#7C3AED' }],
        selectedSizes: product.selectedSizes || []
      });
    }
  }, [product]);

  const filteredCategories = useMemo(() => {
    return categories?.filter(c => c.mainCategory === productData.mainCategory) || [];
  }, [categories, productData.mainCategory]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "تم نسخ الرابط", description: "الرابط جاهز للمشاركة الآن ✨" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdate = () => {
    if (!db || !productRef) return;
    if (!productData.name || !productData.price || !productData.categoryId) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الاسم والسعر والقسم مطلوبون" });
      return;
    }

    setLoading(true);
    const selectedCat = categories?.find(c => c.id === productData.categoryId);
    
    const finalProduct = {
      ...productData,
      categoryName: selectedCat?.name || productData.categoryName,
      updatedAt: serverTimestamp(),
    };

    updateDoc(productRef, finalProduct)
      .then(() => {
        toast({ title: "تم التحديث ✨" });
        router.push('/admin/products');
      })
      .catch(() => {
        setLoading(false);
        toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث المنتج" });
      });
  };

  if (productLoading) return <div className="min-h-screen bg-background flex items-center justify-center font-black animate-pulse">جاري التحميل...</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors" dir="rtl">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <button onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary/40"><ChevronRight className="h-6 w-6" /></button>
              <div>
                <h1 className="text-3xl font-black text-primary dark:text-zinc-100">تعديل المنتج</h1>
                <p className="text-primary/40 dark:text-zinc-500 text-sm">تحديث بيانات قطعة NOVA</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCopyLink} className="h-14 px-6 rounded-2xl border-primary/20 text-primary font-black gap-2">
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />} نسخ الرابط
              </Button>
              <Button onClick={handleUpdate} disabled={loading} className="h-14 px-12 rounded-2xl bg-primary text-white font-black shadow-xl">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ التعديلات"}</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {/* Product Link Info */}
            <div className="nova-card p-8 bg-primary/5 dark:bg-zinc-900 border border-primary/10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-primary shadow-sm"><LinkIcon className="h-6 w-6" /></div>
                  <div>
                    <h4 className="text-[10px] font-black text-primary/40 uppercase tracking-widest">رابط المنتج المباشر</h4>
                    <p className="text-sm font-mono font-bold text-primary dark:text-zinc-300 truncate max-w-xs">{typeof window !== 'undefined' ? `${window.location.origin}/product/${id}` : ''}</p>
                  </div>
               </div>
               <p className="text-[10px] font-bold text-primary/30 max-w-xs text-center md:text-right">استخدمي هذا الرابط في Instagram Bio أو TikTok Shop لتوجيه الزبائن مباشرة لهذه القطعة.</p>
            </div>

            <div className="nova-card p-10 bg-white dark:bg-zinc-900 shadow-premium space-y-10 border border-border dark:border-zinc-800 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-3">
                   <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">القسم الرئيسي</Label>
                   <select className="w-full h-14 px-4 bg-accent/30 dark:bg-zinc-800 rounded-2xl font-bold border-none dark:text-zinc-100" value={productData.mainCategory} onChange={(e) => setProductData({...productData, mainCategory: e.target.value, categoryId: ''})}>
                     {['fashion', 'accessories', 'skincare', 'beauty-devices'].map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                 </div>
                 <div className="space-y-3 md:col-span-2">
                   <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">القسم الفرعي</Label>
                   <select className="w-full h-14 px-4 bg-accent/30 dark:bg-zinc-800 rounded-2xl font-bold border-none dark:text-zinc-100" value={productData.categoryId} onChange={(e) => setProductData({...productData, categoryId: e.target.value})}>
                     <option value="">اختر القسم</option>
                     {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">اسم المنتج</Label>
                  <Input value={productData.name} onChange={(e) => setProductData({...productData, name: e.target.value})} className="h-14 bg-accent/30 dark:bg-zinc-800 rounded-2xl font-bold border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">السعر الحالي (د.ع)</Label>
                  <Input type="number" value={productData.price} onChange={(e) => setProductData({...productData, price: parseFloat(e.target.value) || 0})} className="h-14 bg-accent/30 dark:bg-zinc-800 rounded-2xl font-black text-xl border-none" />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">وصف المنتج العام</Label>
                <Textarea value={productData.description} onChange={(e) => setProductData({...productData, description: e.target.value})} className="min-h-[150px] bg-accent/30 dark:bg-zinc-800 rounded-2xl p-6 border-none" />
              </div>
            </div>

            <div className="nova-card p-10 bg-white dark:bg-zinc-900 shadow-premium space-y-8 border border-border dark:border-zinc-800 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="text-primary dark:text-zinc-100 h-5 w-5" />
                <h3 className="text-xl font-black text-primary dark:text-zinc-100">صور المنتج</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {productData.images?.map((img: string, idx: number) => (
                  <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-accent bg-accent group shadow-sm">
                    <Image src={img} alt="Product" fill className="object-cover" />
                    <button onClick={() => setProductData({...productData, images: productData.images.filter((_: any, i: number) => i !== idx)})} className="absolute top-2 left-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
                <ImageUploadButton onUploadComplete={(url) => setProductData({...productData, images: [...productData.images, url]})} className="aspect-[3/4]" label="إضافة صورة" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
