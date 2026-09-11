
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  ImageIcon,
  Loader2,
  LayoutGrid,
  Sparkles,
  FolderOpen,
  Layers
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ImageUploadButton } from '@/components/ui/image-upload-button';
import { useStore } from '@/providers/store-provider';

export default function AdminCategoriesPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  
  // جلب المجموعات الكبرى
  const mainCatQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(collection(db, 'main-categories'), where('storeId', '==', storeId));
  }, [db, storeId]);
  const { data: mainCategories, loading: mainLoading } = useCollection(mainCatQuery);

  // جلب الأقسام الفرعية
  const subCatQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(collection(db, 'categories'), where('storeId', '==', storeId));
  }, [db, storeId]);
  const { data: subCategories, loading: subLoading } = useCollection(subCatQuery);

  const [activeTab, setActiveTab] = useState("sub");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '', 
    image: '', 
    order: 0,
    mainCategory: '' // ID المجموعة الكبرى للقسم الفرعي
  });

  const handleSaveMain = async () => {
    if (!db) return;
    if (!formData.name) return toast({ variant: "destructive", title: "الاسم مطلوب" });

    setIsSaving(true);
    const slug = formData.slug || formData.name.toLowerCase().trim().replace(/\s+/g, '-');
    const data = { 
      name: formData.name,
      slug,
      image: formData.image,
      order: formData.order,
      storeId,
      updatedAt: serverTimestamp() 
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'main-categories', editingId), data);
        toast({ title: "تم تحديث المجموعة الكبرى" });
      } else {
        await addDoc(collection(db, 'main-categories'), { ...data, createdAt: serverTimestamp() });
        toast({ title: "تمت إضافة المجموعة الكبرى" });
      }
      resetState();
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSub = async () => {
    if (!db) return;
    if (!formData.name || !formData.mainCategory) return toast({ variant: "destructive", title: "الاسم والمجموعة الكبرى مطلوبان" });

    setIsSaving(true);
    const slug = formData.slug || formData.name.toLowerCase().trim().replace(/\s+/g, '-');
    const data = { 
      ...formData,
      slug,
      storeId,
      updatedAt: serverTimestamp() 
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), data);
        toast({ title: "تم تحديث القسم الفرعي" });
      } else {
        await addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp(), isActive: true });
        toast({ title: "تمت إضافة القسم الفرعي" });
      }
      resetState();
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  const resetState = () => {
    setFormData({ name: '', slug: '', image: '', order: 0, mainCategory: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (item: any, type: "main" | "sub") => {
    setFormData({
      name: item.name,
      slug: item.slug || '',
      image: item.image || '',
      order: item.order || 0,
      mainCategory: type === "sub" ? item.mainCategory : ''
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string, coll: string) => {
    if (!db || !confirm('هل أنتِ متأكدة؟ سيؤدي هذا لحذف التصنيفات المرتبطة.')) return;
    try {
      await deleteDoc(doc(db, coll, id));
      toast({ title: "تم الحذف بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                <span className="text-xs font-black tracking-widest uppercase text-primary dark:text-zinc-500">تنظيم المتجر</span>
              </div>
              <h1 className="text-4xl font-black text-primary dark:text-zinc-100">إدارة المجموعات والأقسام</h1>
            </div>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} className="h-12 px-8 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
                <Plus className="ml-2 h-5 w-5" /> إضافة {activeTab === "main" ? "مجموعة كبرى" : "قسم فرعي"}
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); resetState(); }} className="space-y-12">
            <TabsList className="bg-accent/50 dark:bg-zinc-900 h-14 rounded-2xl p-1 border border-border/50 dark:border-zinc-800">
              <TabsTrigger value="main" className="flex-1 rounded-xl font-black gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Layers className="h-4 w-4" /> المجموعات الكبرى
              </TabsTrigger>
              <TabsTrigger value="sub" className="flex-1 rounded-xl font-black gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <FolderOpen className="h-4 w-4" /> الأقسام الفرعية
              </TabsTrigger>
            </TabsList>

            {isAdding && (
              <div className="nova-card p-10 mb-12 border border-primary/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-premium animate-in zoom-in-95 transition-all">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-primary dark:text-zinc-100">{editingId ? 'تعديل البيانات' : 'إضافة جديد'}</h3>
                  <button onClick={resetState} disabled={isSaving} className="p-2 hover:bg-accent dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <X className="h-6 w-6 text-primary/20 dark:text-zinc-700 hover:text-primary" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">الاسم (يظهر للزبونة)</Label>
                      <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        placeholder="مثلاً: الأزياء الملكية"
                        className="h-14 bg-accent/30 dark:bg-zinc-800 rounded-2xl font-bold border-none text-primary dark:text-zinc-100" 
                      />
                    </div>

                    {activeTab === "sub" && (
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">يتبع للمجموعة الكبرى:</Label>
                        <select 
                          className="w-full h-14 px-4 bg-accent/30 dark:bg-zinc-800 rounded-2xl font-bold outline-none border-none dark:text-zinc-100"
                          value={formData.mainCategory}
                          onChange={(e) => setFormData({...formData, mainCategory: e.target.value})}
                        >
                          <option value="">اختر المجموعة</option>
                          {mainCategories?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">الرابط (Slug)</Label>
                         <Input 
                          value={formData.slug} 
                          onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                          placeholder="fashion-2026"
                          className="h-12 bg-accent/30 dark:bg-zinc-800 rounded-xl font-mono text-sm border-none" 
                         />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">الترتيب</Label>
                         <Input 
                          type="number"
                          value={formData.order} 
                          onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})} 
                          className="h-12 bg-accent/30 dark:bg-zinc-800 rounded-xl font-black border-none" 
                         />
                      </div>
                    </div>

                    <Button 
                      onClick={activeTab === "main" ? handleSaveMain : handleSaveSub} 
                      disabled={isSaving}
                      className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
                    >
                      {isSaving ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Save className="ml-2 h-5 w-5" />}
                      حفظ البيانات
                    </Button>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center gap-6">
                    <div className="relative h-48 w-full max-w-sm rounded-[3rem] overflow-hidden bg-accent/30 dark:bg-zinc-800 border-2 border-dashed border-primary/10 dark:border-zinc-700 flex items-center justify-center shadow-inner">
                      {formData.image ? (
                        <Image src={formData.image} alt="Preview" fill className="object-cover" />
                      ) : (
                        <ImageIcon className="h-16 w-16 text-primary/10 dark:text-zinc-700" />
                      )}
                    </div>
                    <ImageUploadButton 
                      onUploadComplete={(url) => setFormData({...formData, image: url})} 
                      label="رفع صورة القسم" 
                      className="w-full max-w-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <TabsContent value="main" className="animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {mainLoading ? <div className="col-span-full text-center py-20 animate-pulse font-black text-primary/20">جاري تحميل المجموعات...</div> :
                  mainCategories?.map((m: any) => (
                   <div key={m.id} className="nova-card p-6 bg-white dark:bg-zinc-900 border border-border/50 dark:border-zinc-800 shadow-sm hover:border-primary/20 transition-all group">
                     <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-6 bg-accent/30 dark:bg-zinc-800">
                        <Image src={m.image || 'https://picsum.photos/seed/placeholder/400/400'} alt={m.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                     </div>
                     <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-primary dark:text-zinc-100 text-lg">{m.name}</h4>
                          <p className="text-[10px] text-primary/30 dark:text-zinc-500 font-mono">/{m.slug}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(m, "main")} className="p-2 hover:bg-accent dark:hover:bg-zinc-800 rounded-lg text-primary/40 transition-all"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(m.id, 'main-categories')} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 transition-all"><Trash2 className="h-4 w-4" /></button>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </TabsContent>

            <TabsContent value="sub" className="animate-in fade-in duration-500">
               {mainCategories?.map((main: any) => (
                 <div key={main.id} className="mb-16 space-y-6">
                   <div className="flex items-center gap-4 pr-2 border-r-4 border-secondary">
                     <h3 className="text-xl font-black text-primary dark:text-zinc-100 flex items-center gap-3">
                       <LayoutGrid className="h-5 w-5 text-secondary" />
                       {main.name}
                     </h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {subCategories?.filter((s: any) => s.mainCategory === main.id).map((sub: any) => (
                       <div key={sub.id} className="nova-card p-6 bg-white dark:bg-zinc-900 border border-border/50 dark:border-zinc-800 shadow-sm hover:border-primary/20 transition-all group">
                         <div className="flex items-center gap-5">
                           <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-accent/30 dark:bg-zinc-800 flex-shrink-0 border border-border/20">
                             <Image src={sub.image || 'https://picsum.photos/seed/placeholder/200/200'} alt={sub.name} fill className="object-cover" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <h4 className="font-black text-primary dark:text-zinc-100 text-sm truncate">{sub.name}</h4>
                             <p className="text-[10px] text-primary/30 dark:text-zinc-500 font-mono mt-0.5">/{sub.slug}</p>
                             <div className="mt-3 flex gap-2">
                               <button onClick={() => startEdit(sub, "sub")} className="p-2 bg-accent/50 dark:bg-zinc-800 rounded-lg text-primary/40 hover:text-primary transition-all shadow-sm"><Edit className="h-4 w-4" /></button>
                               <button onClick={() => handleDelete(sub.id, 'categories')} className="p-2 bg-red-50 dark:bg-red-900/10 rounded-lg text-red-400 hover:text-red-600 transition-all shadow-sm"><Trash2 className="h-4 w-4" /></button>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AdminGuard>
  );
}
