
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
  ImageIcon,
  Move
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function AdminCategoriesPage() {
  const db = useFirestore();
  const catQuery = useMemo(() => query(collection(db, 'categories'), orderBy('order', 'asc')), [db]);
  const { data: categories, loading } = useCollection(catQuery);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', image: '', order: 0, isActive: true });

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast({ variant: "destructive", title: "خطأ", description: "الاسم والاسم اللطيف مطلوبان" });
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), formData);
        toast({ title: "تم التحديث", description: "تم تحديث القسم بنجاح" });
      } else {
        await addDoc(collection(db, 'categories'), { ...formData, order: (categories?.length || 0) + 1 });
        toast({ title: "تمت الإضافة", description: "تمت إضافة القسم الجديد بنجاح" });
      }
      resetForm();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ القسم" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('حذف هذا القسم قد يؤثر على المنتجات المرتبطة به. هل أنتِ متأكدة؟')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast({ title: "تم الحذف", description: "تم حذف القسم بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حذف القسم" });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', image: '', order: 0, isActive: true });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (cat: any) => {
    setFormData({ name: cat.name, slug: cat.slug, image: cat.image || '', order: cat.order, isActive: cat.isActive });
    setEditingId(cat.id);
    setIsAdding(true);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري ترتيب الأقسام...</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">هيكلية المتجر</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black gold-text">إدارة الأقسام</h1>
            </div>
            
            <Button 
              onClick={() => setIsAdding(true)} 
              className="h-12 px-8 rounded-2xl bg-primary text-black font-black hover:scale-105 transition-all"
            >
              <Plus className="ml-2 h-5 w-5" />
              إضافة قسم جديد
            </Button>
          </div>

          {isAdding && (
            <div className="nova-card p-10 mb-12 border-primary/20 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white">{editingId ? 'تعديل قسم' : 'قسم جديد'}</h3>
                <button onClick={resetForm} className="text-white/20 hover:text-white"><X className="h-6 w-6" /></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-white/40 tracking-widest uppercase">اسم القسم *</Label>
                  <Input 
                    placeholder="مثلاً: فساتين"
                    className="bg-white/5 border-white/10 rounded-xl"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black text-white/40 tracking-widest uppercase">الاسم اللطيف (Slug) *</Label>
                  <Input 
                    placeholder="dresses"
                    className="bg-white/5 border-white/10 rounded-xl"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black text-white/40 tracking-widest uppercase">URL الصورة</Label>
                  <Input 
                    placeholder="https://..."
                    className="bg-white/5 border-white/10 rounded-xl"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full h-10 bg-primary text-black font-black rounded-xl" onClick={handleSave}>
                    <Save className="ml-2 h-4 w-4" />
                    حفظ القسم
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories?.map((cat: any) => (
              <div key={cat.id} className="nova-card p-6 flex items-center gap-6 group hover:border-primary/50 transition-all">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 celestial-glow flex-shrink-0">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-black text-white text-lg">{cat.name}</h4>
                  <p className="text-[10px] text-white/40 font-mono tracking-widest">/{cat.slug}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={() => startEdit(cat)} className="p-2 text-white/20 hover:text-primary transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-1 text-white/10 group-hover:text-primary/40 transition-colors">
                  <Move className="h-4 w-4" />
                  <span className="text-[10px] font-black">{cat.order}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
        
        <Footer />
      </div>
    </AdminGuard>
  );
}
