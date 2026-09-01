
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Layout, 
  Tag, 
  Palette, 
  Layers, 
  Settings,
  Sparkles,
  ChevronRight
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
    barcode: '',
    brand: '',
    description: '',
    material: '',
    purchasePrice: 0,
    price: 0,
    originalPrice: 0,
    categoryId: '',
    categoryName: '',
    images: [] as string[],
    colors: [{ name: '', code: '' }],
    selectedSizes: [] as string[],
    variants: [] as any[],
    status: 'active',
    isNew: true,
    isBestSeller: false,
    isFeatured: false
  });

  const [activeTab, setActiveTab] = useState('basic');

  const generateVariants = () => {
    const newVariants: any[] = [];
    productData.colors.forEach(color => {
      if (!color.name) return;
      productData.selectedSizes.forEach(size => {
        newVariants.push({
          color: color.name,
          size: size,
          stock: 0,
          sku: `${productData.sku}-${color.name}-${size}`,
          barcode: ''
        });
      });
    });
    setProductData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleSave = () => {
    if (!productData.name || !productData.price || !productData.categoryId) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء الحقول الأساسية للمنتج" });
      return;
    }

    setLoading(true);
    const selectedCat = categories?.find(c => c.id === productData.categoryId);
    const colRef = collection(db, 'products');
    
    const newProduct = {
      ...productData,
      categoryName: selectedCat?.name || '',
      storeId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDoc(colRef, newProduct)
      .then(() => {
        toast({ title: "تم الحفظ", description: "تمت إضافة المنتج الجديد بنجاح إلى Firestore" });
        router.push('/admin/products');
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: newProduct,
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      });
  };

  const handleImageUpload = (url: string) => {
    setProductData(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
  };

  const removeImage = (idx: number) => {
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  const TABS = [
    { id: 'basic', label: 'المعلومات الأساسية', icon: Layout },
    { id: 'pricing', label: 'التسعير', icon: Tag },
    { id: 'images', label: 'الصور', icon: ImageIcon },
    { id: 'options', label: 'الألوان والقياسات', icon: Palette },
    { id: 'inventory', label: 'المخزون', icon: Layers },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">NOVA NEW COLLECTION</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black gold-text">إضافة منتج</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white/40 font-bold" onClick={() => router.back()}>إلغاء</Button>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="h-12 px-12 rounded-2xl bg-primary text-black font-black shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
            >
              {loading ? "جاري الحفظ..." : "حفظ المنتج في Firestore"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3 space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-5 rounded-2xl transition-all font-black text-sm",
                  activeTab === tab.id 
                    ? "bg-primary text-black shadow-lg shadow-primary/10" 
                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                )}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-9">
            <div className="nova-card p-10 md:p-16 celestial-glow">
              {activeTab === 'basic' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-xs font-black text-white/40 uppercase tracking-widest">اسم المنتج *</Label>
                      <Input 
                        placeholder="فستان سهرة"
                        className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold"
                        value={productData.name}
                        onChange={(e) => setProductData({...productData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black text-white/40 uppercase tracking-widest">SKU المنتج</Label>
                      <Input 
                        placeholder="NOVA-DRS-001"
                        className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold"
                        value={productData.sku}
                        onChange={(e) => setProductData({...productData, sku: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-xs font-black text-white/40 uppercase tracking-widest">القسم *</Label>
                      <select 
                        className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none appearance-none"
                        value={productData.categoryId}
                        onChange={(e) => setProductData({...productData, categoryId: e.target.value})}
                      >
                        <option value="">اختر القسم</option>
                        {categories?.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black text-white/40 uppercase tracking-widest">الخامة</Label>
                      <Input 
                        placeholder="حرير، مخمل، إلخ"
                        className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold"
                        value={productData.material}
                        onChange={(e) => setProductData({...productData, material: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black text-white/40 uppercase tracking-widest">وصف المنتج</Label>
                    <Textarea 
                      placeholder="تفاصيل الفخامة..."
                      className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl font-bold"
                      value={productData.description}
                      onChange={(e) => setProductData({...productData, description: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <Label className="text-xs font-black text-white/40 uppercase tracking-widest">سعر الشراء</Label>
                      <Input 
                        type="number"
                        className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold text-left dir-ltr"
                        value={productData.purchasePrice}
                        onChange={(e) => setProductData({...productData, purchasePrice: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black text-white/40 uppercase tracking-widest">سعر البيع *</Label>
                      <Input 
                        type="number"
                        className="h-14 bg-white/5 border-white/10 rounded-2xl font-black text-primary text-left dir-ltr"
                        value={productData.price}
                        onChange={(e) => setProductData({...productData, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black text-white/40 uppercase tracking-widest">السعر قبل الخصم</Label>
                      <Input 
                        type="number"
                        className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold text-white/40 text-left dir-ltr"
                        value={productData.originalPrice}
                        onChange={(e) => setProductData({...productData, originalPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'images' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {productData.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-[3/4] bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <Image src={img} alt="Preview" fill className="object-cover" />
                        <button 
                          className="absolute top-2 left-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={() => removeImage(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <ImageUploadButton 
                      onUploadComplete={handleImageUpload}
                      className="aspect-[3/4]"
                      label="رفع صورة"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'options' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-6">
                    <Label className="text-lg font-black text-white">الألوان</Label>
                    <div className="space-y-4">
                      {productData.colors.map((c, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <Input 
                            placeholder="اسم اللون"
                            className="h-12 bg-white/5 border-white/10 rounded-xl font-bold"
                            value={c.name}
                            onChange={(e) => {
                              const newColors = [...productData.colors];
                              newColors[idx].name = e.target.value;
                              setProductData({...productData, colors: newColors});
                            }}
                          />
                          <Input 
                            type="color"
                            className="w-20 h-12 p-1 bg-white/5 border-white/10 rounded-xl cursor-pointer"
                            value={c.code || '#000000'}
                            onChange={(e) => {
                              const newColors = [...productData.colors];
                              newColors[idx].code = e.target.value;
                              setProductData({...productData, colors: newColors});
                            }}
                          />
                          <Button variant="ghost" size="icon" onClick={() => {
                            const newColors = [...productData.colors];
                            newColors.splice(idx, 1);
                            setProductData({...productData, colors: newColors});
                          }}>
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full border-dashed border-white/10 text-white/40 h-12 rounded-xl" onClick={() => setProductData({...productData, colors: [...productData.colors, { name: '', code: '' }] })}>
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة لون
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Label className="text-lg font-black text-white">القياسات</Label>
                    <div className="flex flex-wrap gap-3">
                      {SIZES.map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            const newSizes = productData.selectedSizes.includes(s)
                              ? productData.selectedSizes.filter(sz => sz !== s)
                              : [...productData.selectedSizes, s];
                            setProductData({...productData, selectedSizes: newSizes});
                          }}
                          className={cn(
                            "w-14 h-14 rounded-xl border-2 font-black transition-all",
                            productData.selectedSizes.includes(s) 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-white/5 bg-white/5 text-white/20"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-white" onClick={generateVariants}>
                    تحديث خيارات المخزون
                  </Button>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="nova-card border-none bg-white/5 p-0 overflow-hidden">
                    <table className="w-full text-right">
                      <thead className="bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">
                        <tr>
                          <th className="p-4">الخيار</th>
                          <th className="p-4">المخزون</th>
                          <th className="p-4">SKU</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productData.variants.map((v, idx) => (
                          <tr key={idx} className="border-t border-white/5">
                            <td className="p-4 font-bold">{v.color} / {v.size}</td>
                            <td className="p-4">
                              <Input 
                                type="number"
                                className="w-24 h-10 bg-black/40 border-white/5 rounded-lg text-center font-black"
                                value={v.stock}
                                onChange={(e) => {
                                  const newVariants = [...productData.variants];
                                  newVariants[idx].stock = e.target.value === '' ? 0 : (parseInt(e.target.value) || 0);
                                  setProductData({...productData, variants: newVariants});
                                }}
                              />
                            </td>
                            <td className="p-4">
                              <Input 
                                className="h-10 bg-black/40 border-white/5 rounded-lg text-xs font-mono"
                                value={v.sku}
                                onChange={(e) => {
                                  const newVariants = [...productData.variants];
                                  newVariants[idx].sku = e.target.value;
                                  setProductData({...productData, variants: newVariants});
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">وصل حديثاً</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={productData.isNew} 
                        className="h-6 w-6 accent-primary"
                        onChange={(e) => setProductData({...productData, isNew: e.target.checked})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-xs font-black text-white/40 uppercase tracking-widest">حالة العرض</Label>
                    <select 
                      className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none appearance-none"
                      value={productData.status}
                      onChange={(e) => setProductData({...productData, status: e.target.value})}
                    >
                      <option value="active" className="bg-slate-900 text-green-400">نشط</option>
                      <option value="draft" className="bg-slate-900 text-white/40">مسودة</option>
                      <option value="out_of_stock" className="bg-slate-900 text-red-400">نفد المخزون</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-12 flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="text-white/20 font-bold"
                onClick={() => {
                  const currentIndex = TABS.findIndex(t => t.id === activeTab);
                  if (currentIndex > 0) setActiveTab(TABS[currentIndex - 1].id);
                }}
                disabled={activeTab === 'basic'}
              >
                السابق
              </Button>
              <Button 
                className="bg-white/5 text-white font-bold h-12 px-8 rounded-2xl hover:bg-white/10"
                onClick={() => {
                  const currentIndex = TABS.findIndex(t => t.id === activeTab);
                  if (currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1].id);
                  else handleSave();
                }}
              >
                {activeTab === 'settings' ? 'حفظ نهائي في Firestore' : 'التالي'}
                <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
