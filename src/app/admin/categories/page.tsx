
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
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
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ImageUploadButton } from '@/components/ui/image-upload-button';
import { useStore } from '@/providers/store-provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  const [formData, setFormData] = useState({ name: '', slug: '', image: '', order: 0 });

  const handleSave = () => {
    if (!db) return;
    if (!formData.name) return toast({ variant: "destructive", title: "الاسم مطلوب" });

    setIsSaving(true);
    const data = { 
      ...formData, 
      storeId, 
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'), 
      updatedAt: new Date().toISOString() 
    };

    if (editingId) {
      updateDoc(doc(db, 'categories', editingId), data)
        .then(() => {
          toast({ title: "تم التحديث بنجاح", description: `تم حفظ تعديلات قسم ${formData.name}` });
          resetState();
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `categories/${editingId}`, operation: 'update' }));
          toast({ variant: "destructive", title: "فشل الحفظ" });
        })
        .finally(() => setIsSaving(false));
    } else {
      addDoc(collection(db, 'categories'), { 
        ...data, 
        createdAt: new Date().toISOString(), 
        order: categories.length + 1,
        isActive: true
      })
        .then(() => {
          toast({ title: "تمت إضافة القسم", description: `أصبح قسم ${formData.name} متاحاً الآن في المتجر` });
          resetState();
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'categories', operation: 'create' }));
          toast({ variant: "destructive", title: "فشل الإضافة" });
        })
        .finally(() => setIsSaving(false));
    }
  };

  const resetState = () => {
    setFormData({ name: '', slug: '', image: '', order: 0 });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (!db) return;
    if (!confirm(`هل أنتِ متأكدة من حذف قسم ${name}؟ سيؤدي ذلك لإزالته من المتجر.`)) return;
    deleteDoc(doc(db, 'categories', id))
      .then(() => {
        toast({ title: "تم الحذف بنجاح" });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `categories/${id}`, operation: 'delete' }));
        toast({ variant: "destructive", title: "فشل الحذف" });
      });
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black text-primary">إدارة الأقسام</h1>
              <p className="text-primary/40 text-sm mt-1">تنسيق تصنيفات الملابس في NOVA</p>
            </div>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} className="h-12 px-8 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
                <Plus className="ml-2 h-5 w-5" /> إضافة قسم
              </Button>
            )}
          </div>

          {isAdding && (
            <div className="nova-card p-10 mb-12 border-primary/10 animate-in fade-in zoom-in-95 bg-white shadow-premium">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-primary">{editingId ? 'تعديل القسم' : 'قسم جديد'}</h3>
                <button onClick={resetState} disabled={isSaving}><X className="h-6 w-6 text-primary/20 hover:text-primary" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-primary/40 uppercase tracking-widest">اسم القسم</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      className="h-14 bg-accent/30 border-border rounded-2xl text-primary font-bold focus:border-primary/50" 
                      disabled={isSaving}
                    />
                  </div>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="ml-2 h-5 w-5" /> 
                        حفظ القسم
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex flex-col items-center gap-6">
                  <div className="relative h-32 w-32 rounded-3xl overflow-hidden bg-accent border-2 border-dashed border-primary/10 flex items-center justify-center">
                    {formData.image ? (
                      <Image src={formData.image} alt="Preview" fill className="object-cover" />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-primary/10" />
                    )}
                  </div>
                  <ImageUploadButton 
                    onUploadComplete={(url) => setFormData({...formData, image: url})} 
                    label="تغيير صورة القسم" 
                    className="max-w-[200px]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat: any, idx: number) => (
              <div key={`${cat.id}-${idx}`} className="nova-card p-6 flex items-center gap-6 group hover:border-primary/20 bg-white shadow-sm transition-all">
                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-accent border border-border">
                  <Image src={cat.image || 'https://picsum.photos/seed/cat/200/200'} alt={cat.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-primary">{cat.name}</h4>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => { setFormData(cat); setEditingId(cat.id); setIsAdding(true); }} className="text-primary/20 hover:text-primary transition-colors p-1"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="text-primary/20 hover:text-red-500 transition-colors p-1"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
            {loading && categories.length === 0 && (
              <div className="col-span-full py-20 text-center animate-pulse font-bold text-primary/20">جاري تحميل الأقسام...</div>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
