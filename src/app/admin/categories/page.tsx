
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
  LayoutGrid, 
  ImageIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ImageUploadButton } from '@/components/ui/image-upload-button';
import { useStore } from '@/providers/store-provider';

export default function AdminCategoriesPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  
  const catQuery = useMemo(() => query(collection(db, 'categories'), where('storeId', '==', storeId)), [db, storeId]);
  const { data: rawCategories, loading } = useCollection(catQuery);

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return [...rawCategories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [rawCategories]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', image: '', order: 0 });

  const handleSave = async () => {
    if (!formData.name) return toast({ variant: "destructive", title: "الاسم مطلوب" });

    const data = { ...formData, storeId, slug: formData.name.toLowerCase().replace(/\s+/g, '-'), updatedAt: new Date().toISOString() };

    if (editingId) {
      await updateDoc(doc(db, 'categories', editingId), data);
      toast({ title: "تم التحديث" });
    } else {
      await addDoc(collection(db, 'categories'), { ...data, createdAt: new Date().toISOString(), order: categories.length + 1 });
      toast({ title: "تمت الإضافة" });
    }
    setFormData({ name: '', slug: '', image: '', order: 0 });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('سيتم حذف القسم نهائياً، هل أنتِ متأكدة؟')) return;
    await deleteDoc(doc(db, 'categories', id));
    toast({ title: "تم الحذف" });
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black gold-text">إدارة الأقسام</h1>
              <p className="text-white/40 text-sm mt-1">تنسيق تصنيفات الملابس في NOVA</p>
            </div>
            <Button onClick={() => setIsAdding(true)} className="h-12 px-8 rounded-2xl bg-primary text-black font-black"><Plus className="ml-2 h-5 w-5" /> إضافة قسم</Button>
          </div>

          {isAdding && (
            <div className="nova-card p-10 mb-12 border-primary/20 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black">{editingId ? 'تعديل القسم' : 'قسم جديد'}</h3>
                <button onClick={() => { setIsAdding(false); setEditingId(null); }}><X className="h-6 w-6 text-white/20" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-white/40 uppercase">اسم القسم</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                  </div>
                  <Button onClick={handleSave} className="w-full h-12 bg-primary text-black font-black rounded-xl"><Save className="ml-2 h-4 w-4" /> حفظ القسم</Button>
                </div>
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                    {formData.image ? <Image src={formData.image} alt="Cat" fill className="object-cover" /> : <ImageIcon className="h-full w-full p-6 text-white/10" />}
                  </div>
                  <ImageUploadButton onUploadComplete={(url) => setFormData({...formData, image: url})} label="رفع صورة القسم" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat: any) => (
              <div key={cat.id} className="nova-card p-6 flex items-center gap-6 group">
                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-white/5 border border-white/5">
                  <Image src={cat.image || 'https://picsum.photos/seed/cat/200/200'} alt={cat.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-white">{cat.name}</h4>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => { setFormData(cat); setEditingId(cat.id); setIsAdding(true); }} className="text-white/20 hover:text-primary transition-colors"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="text-white/20 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
