
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  ImageIcon,
  Loader2,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ImageUploadButton } from '@/components/ui/image-upload-button';
import { useStore } from '@/providers/store-provider';

const MAIN_CATEGORIES = [
  { id: 'fashion', name: 'الأزياء' },
  { id: 'accessories', name: 'الأكسسوارات' },
  { id: 'skincare', name: 'العناية بالبشرة' },
  { id: 'beauty-devices', name: 'أجهزة العناية' },
];

export default function AdminCategoriesPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const catQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(collection(db, 'categories'), where('storeId', '==', storeId));
  }, [db, storeId]);

  const { data: rawCategories, loading } = useCollection(catQuery);

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return [...rawCategories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [rawCategories]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '', 
    image: '', 
    order: 0,
    mainCategory: 'fashion' 
  });

  const handleSave = async () => {
    if (!db) return;
    if (!formData.name) return toast({ variant: "destructive", title: "الاسم مطلوب" });

    setIsSaving(true);
    const data = { 
      ...formData, 
      storeId, 
      slug: formData.slug || formData.name.toLowerCase().trim().replace(/\s+/g, '-'), 
      updatedAt: serverTimestamp() 
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), data);
        toast({ title: "تم التحديث", description: `تم حفظ تعديلات ${formData.name}` });
      } else {
        await addDoc(collection(db, 'categories'), { 
          ...data, 
          createdAt: serverTimestamp(), 
          order: categories.length + 1,
          isActive: true
        });
        toast({ title: "تمت إضافة القسم", description: `أصبح قسم ${formData.name} متاحاً الآن` });
      }
      resetState();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "فشل الحفظ", description: "تأكدي من صلاحيات الوصول" });
    } finally {
      setIsSaving(false);
    }
  };

  const resetState = () => {
    setFormData({ name: '', slug: '', image: '', order: 0, mainCategory: 'fashion' });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (cat: any) => {
    setFormData({
      name: cat.name,
      slug: cat.slug || '',
      image: cat.image || '',
      order: cat.order || 0,
      mainCategory: cat.mainCategory || 'fashion'
    });
    setEditingId(cat.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!db) return;
    if (!confirm(`هل أنتِ متأكدة من حذف قسم ${name}؟ سيؤدي هذا لإخفاء المنتجات المرتبطة به.`)) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                <span className="text-xs font-black tracking-widest uppercase text-primary">تنظيم المجموعات</span>
              </div>
              <h1 className="text-4xl font-black text-primary">إدارة الأقسام والأسماء</h1>
            </div>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} className="h-12 px-8 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
                <Plus className="ml-2 h-5 w-5" /> إضافة قسم فرعي جديد
              </Button>
            )}
          </div>

          {isAdding && (
            <div className="nova-card p-10 mb-12 border-primary/10 bg-white shadow-premium animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-primary">{editingId ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}</h3>
                <button onClick={resetState} disabled={isSaving} className="p-2 hover:bg-accent rounded-full transition-colors">
                  <X className="h-6 w-6 text-primary/20 hover:text-primary" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">اسم القسم (الذي يظهر للزبونة)</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      placeholder="مثلاً: فساتين صيفية"
                      className="h-14 bg-accent/30 rounded-2xl font-bold border-none focus:ring-2 focus:ring-primary/20" 
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">يتبع لأي قسم رئيسي؟</Label>
                    <select 
                      className="w-full h-14 px-4 bg-accent/30 rounded-2xl font-bold outline-none border-none focus:ring-2 focus:ring-primary/20"
                      value={formData.mainCategory}
                      onChange={(e) => setFormData({...formData, mainCategory: e.target.value})}
                    >
                      {MAIN_CATEGORIES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">الرابط (Slug)</Label>
                       <Input 
                        value={formData.slug} 
                        onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                        placeholder="dresses-2026"
                        className="h-12 bg-accent/30 rounded-xl font-mono text-sm" 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">الترتيب</Label>
                       <Input 
                        type="number"
                        value={formData.order} 
                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})} 
                        className="h-12 bg-accent/30 rounded-xl font-black" 
                       />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
                  >
                    {isSaving ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Save className="ml-2 h-5 w-5" />}
                    {editingId ? 'حفظ التغييرات' : 'تثبيت القسم الجديد'}
                  </Button>
                </div>
                
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="relative h-48 w-full max-w-sm rounded-[3rem] overflow-hidden bg-accent border-2 border-dashed border-primary/10 flex items-center justify-center shadow-inner group">
                    {formData.image ? (
                      <Image src={formData.image} alt="Preview" fill className="object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <ImageIcon className="h-16 w-16 text-primary/10" />
                    )}
                  </div>
                  <ImageUploadButton 
                    onUploadComplete={(url) => setFormData({...formData, image: url})} 
                    label="صورة القسم" 
                    className="w-full max-w-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-12">
            {MAIN_CATEGORIES.map(main => (
              <div key={main.id} className="space-y-6">
                <div className="flex items-center gap-4 pr-2">
                  <div className="h-10 w-1 bg-secondary rounded-full" />
                  <h3 className="text-xl font-black text-primary flex items-center gap-3">
                    <LayoutGrid className="h-5 w-5 text-secondary" />
                    {main.name}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.filter(c => c.mainCategory === main.id).map((cat: any) => (
                    <div key={cat.id} className="nova-card p-6 bg-white border border-border/50 shadow-sm hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-accent flex-shrink-0 border border-border/20">
                          <Image src={cat.image || 'https://picsum.photos/seed/placeholder/200/200'} alt={cat.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-primary text-sm truncate">{cat.name}</h4>
                          <p className="text-[10px] text-primary/30 font-mono mt-0.5">/{cat.slug}</p>
                          <div className="mt-3 flex gap-2">
                            <button 
                              onClick={() => startEdit(cat)} 
                              className="p-2 bg-accent rounded-lg text-primary/40 hover:text-primary hover:bg-white transition-all shadow-sm"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(cat.id, cat.name)} 
                              className="p-2 bg-red-50 rounded-lg text-red-400 hover:text-red-600 hover:bg-white transition-all shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {categories.filter(c => c.mainCategory === main.id).length === 0 && (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-accent rounded-3xl opacity-30 text-primary font-bold text-xs italic">
                      لا توجد أقسام فرعية في هذا القسم حالياً
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
