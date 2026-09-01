
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/Header'; // Using simplified header
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminHeader as DedicatedAdminHeader } from '@/components/layout/AdminHeader';
import { 
  ImageIcon, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImageUploadButton } from '@/components/ui/image-upload-button';
import { useStore } from '@/providers/store-provider';
import Image from 'next/image';

export default function AdminSliderPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', subtitle: '', image: '', order: 0 });

  const sliderQuery = useMemo(() => query(collection(db, 'slider'), where('storeId', '==', storeId)), [db, storeId]);
  const { data: slides, loading } = useCollection(sliderQuery);

  const sortedSlides = useMemo(() => {
    if (!slides) return [];
    return [...slides].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [slides]);

  const handleSave = async () => {
    if (!formData.image || !formData.title) {
      toast({ variant: "destructive", title: "خطأ", description: "الصورة والعنوان مطلوبان" });
      return;
    }

    try {
      await addDoc(collection(db, 'slider'), {
        ...formData,
        storeId,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      toast({ title: "تم الحفظ", description: "تمت إضافة شريحة السلايدر بنجاح" });
      setFormData({ title: '', subtitle: '', image: '', order: slides?.length || 0 });
      setIsAdding(false);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في الحفظ" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الشريحة؟')) return;
    await deleteDoc(doc(db, 'slider', id));
    toast({ title: "تم الحذف", description: "تم حذف الشريحة من السلايدر" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-arabic">
      <DedicatedAdminHeader />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black gold-text">إدارة السلايدر</h1>
            <p className="text-white/40 text-sm mt-1">تعديل الصور المتحركة في واجهة المتجر</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="h-12 px-8 rounded-2xl bg-primary text-black font-black">
            <Plus className="ml-2 h-5 w-5" />
            إضافة شريحة
          </Button>
        </div>

        {isAdding && (
          <div className="nova-card p-10 mb-12 border-primary/20 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black">شريحة جديدة</h3>
              <button onClick={() => setIsAdding(false)}><X className="h-6 w-6 text-white/20" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-white/40">العنوان الرئيسي</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="مثلاً: مجموعة الشتاء 2026" className="bg-white/5 border-white/10 h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-white/40">العنوان الفرعي</Label>
                  <Input value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} placeholder="وصف قصير جذاب..." className="bg-white/5 border-white/10 h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-white/40">الترتيب</Label>
                  <Input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} className="bg-white/5 border-white/10 h-12" />
                </div>
              </div>
              <div className="space-y-4 flex flex-col justify-center items-center border-r border-white/5">
                <div className="relative h-48 w-full max-w-sm rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                  {formData.image ? <Image src={formData.image} alt="Preview" fill className="object-cover" /> : <ImageIcon className="h-12 w-12 text-white/10" />}
                </div>
                <ImageUploadButton onUploadComplete={(url) => setFormData({...formData, image: url})} label="رفع صورة السلايدر" className="w-full max-w-sm" />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full mt-10 h-14 bg-primary text-black font-black rounded-2xl">تثبيت في السلايدر</Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedSlides.map((slide: any) => (
            <div key={slide.id} className="nova-card overflow-hidden group">
              <div className="relative h-56 w-full">
                <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/60 p-6 flex flex-col justify-end">
                  <Badge className="w-fit mb-2 bg-primary text-black font-bold">#{slide.order}</Badge>
                  <h4 className="font-black text-lg text-white">{slide.title}</h4>
                  <p className="text-xs text-white/60 line-clamp-1">{slide.subtitle}</p>
                </div>
                <button onClick={() => handleDelete(slide.id)} className="absolute top-4 left-4 p-2 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {sortedSlides.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center opacity-20 border-2 border-dashed border-white/10 rounded-[2.5rem]">
              <ImageIcon className="h-12 w-12 mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest">السلايدر فارغ حالياً</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
