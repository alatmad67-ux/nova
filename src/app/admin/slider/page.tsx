"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ImageIcon, 
  Plus, 
  Trash2, 
  X,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImageUploadButton } from '@/components/ui/image-upload-button';
import { useStore } from '@/providers/store-provider';
import Image from 'next/image';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminSliderPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', subtitle: '', image: '', order: 0, link: '' });

  const sliderQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'sliders'), 
      where('storeId', '==', storeId)
    );
  }, [db, storeId]);
  
  const { data: slides, loading } = useCollection(sliderQuery);

  const sortedSlides = useMemo(() => {
    if (!slides) return [];
    return [...slides].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [slides]);

  const handleSave = () => {
    if (!db) return;
    if (!formData.image || !formData.title) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "الصورة والعنوان مطلوبان" });
      return;
    }

    setIsSaving(true);
    const sliderData = {
      ...formData,
      storeId,
      isActive: true,
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, 'sliders'), sliderData)
      .then(() => {
        toast({ title: "تم الحفظ بنجاح", description: "تمت إضافة شريحة السلايدر لقاعدة البيانات" });
        setFormData({ title: '', subtitle: '', image: '', order: slides?.length || 0, link: '' });
        setIsAdding(false);
      })
      .catch(async (serverError) => {
        console.error("Firestore Save Error:", serverError);
        const permissionError = new FirestorePermissionError({ 
          path: 'sliders', 
          operation: 'create',
          requestResourceData: sliderData
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (!confirm('هل تريد حذف هذه الشريحة؟')) return;
    deleteDoc(doc(db, 'sliders', id))
      .then(() => {
        toast({ title: "تم الحذف", description: "تم مسح الشريحة من قاعدة البيانات" });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `sliders/${id}`, operation: 'delete' }));
      });
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors">
        <AdminHeader />
        
        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-black text-primary dark:text-zinc-100">إدارة السلايدر</h1>
              <p className="text-primary/40 dark:text-zinc-500 text-sm mt-1">التحكم المباشر في صور واجهة المتجر الرئيسية</p>
            </div>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} className="h-12 px-8 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <Plus className="ml-2 h-5 w-5" />
                إضافة شريحة جديدة
              </Button>
            )}
          </div>

          {isAdding && (
            <div className="nova-card p-10 mb-12 border-primary/10 dark:border-zinc-800 animate-in fade-in zoom-in-95 bg-white dark:bg-zinc-900 shadow-premium transition-all">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-primary dark:text-zinc-100">شريحة جديدة</h3>
                <button onClick={() => setIsAdding(false)} disabled={isSaving} className="p-2 hover:bg-accent dark:hover:bg-zinc-800 rounded-full transition-colors"><X className="h-6 w-6 text-primary/20 dark:text-zinc-700 hover:text-primary dark:hover:text-zinc-300" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">العنوان الرئيسي</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="مثلاً: مجموعة الشتاء 2026" className="h-12 bg-accent/30 dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-xl text-primary dark:text-zinc-100 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">العنوان الفرعي</Label>
                    <Input value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} placeholder="وصف قصير جذاب..." className="h-12 bg-accent/30 dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-xl text-primary dark:text-zinc-100 font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">الترتيب</Label>
                      <Input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})} className="h-12 bg-accent/30 dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-xl text-primary dark:text-zinc-100 font-black" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase tracking-widest">الرابط (اختياري)</Label>
                      <Input value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} placeholder="/shop" className="h-12 bg-accent/30 dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-xl text-primary dark:text-zinc-100 font-bold" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4 flex flex-col justify-center items-center">
                  <div className="relative h-48 w-full max-w-sm rounded-3xl overflow-hidden bg-accent dark:bg-zinc-800 border-2 border-dashed border-primary/10 dark:border-zinc-700 flex items-center justify-center transition-colors">
                    {formData.image ? <Image src={formData.image} alt="Preview" fill className="object-cover" /> : <ImageIcon className="h-12 w-12 text-primary/10 dark:text-zinc-700" />}
                  </div>
                  <ImageUploadButton onUploadComplete={(url) => setFormData({...formData, image: url})} label="رفع صورة السلايدر" className="w-full max-w-sm" />
                </div>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full mt-10 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري الحفظ في الفاير ستور...
                  </>
                ) : (
                  <>
                    <Save className="ml-2 h-5 w-5" />
                    تثبيت في السلايدر الآن
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedSlides.map((slide: any, idx: number) => (
              <div key={`${slide.id}-${idx}`} className="nova-card overflow-hidden group bg-white dark:bg-zinc-900 border-border dark:border-zinc-800 shadow-sm transition-all">
                <div className="relative h-56 w-full">
                  <Image src={slide.image} alt={slide.title} fill className="object-cover dark:brightness-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 dark:from-black/80 to-transparent p-6 flex flex-col justify-end">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black bg-white dark:bg-zinc-800 text-primary dark:text-zinc-100 px-2 py-0.5 rounded-full shadow-sm">#{slide.order}</span>
                    </div>
                    <h4 className="font-black text-lg text-white">{slide.title}</h4>
                    <p className="text-xs text-white/60 line-clamp-1 font-bold">{slide.subtitle}</p>
                  </div>
                  <button onClick={() => handleDelete(slide.id)} className="absolute top-4 left-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {sortedSlides.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center opacity-20 dark:opacity-10 border-2 border-dashed border-primary/20 dark:border-zinc-800 rounded-[2.5rem] text-primary dark:text-zinc-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest">السلايدر فارغ حالياً في Firestore</p>
              </div>
            )}
            {loading && (
              <div className="col-span-full py-20 text-center animate-pulse text-primary/20 dark:text-zinc-800 font-black">جاري مزامنة السلايدر...</div>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
