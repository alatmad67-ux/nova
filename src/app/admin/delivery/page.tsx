
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
  Truck, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Phone, 
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useStore } from '@/providers/store-provider';

export default function DeliveryCompaniesPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const companiesQuery = useMemo(() => {
    if (!db || !storeId) return null;
    return query(
      collection(db, 'delivery-companies'),
      where('storeId', '==', storeId)
    );
  }, [db, storeId]);
  
  const { data: companies, loading, error: queryError } = useCollection(companiesQuery);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    apiUrl: '',
    isActive: true
  });

  const handleSave = () => {
    if (!db) return;
    if (!formData.name) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إدخال اسم الشركة" });
      return;
    }

    setIsSaving(true);
    const companyData = {
      ...formData,
      storeId,
      updatedAt: serverTimestamp()
    };

    if (editingId) {
      const docRef = doc(db, 'delivery-companies', editingId);
      updateDoc(docRef, companyData)
        .then(() => {
          toast({ title: "تم التحديث بنجاح", description: `تم حفظ تعديلات شركة ${formData.name}` });
          resetForm();
        })
        .catch((error: any) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ 
            path: docRef.path, 
            operation: 'update',
            requestResourceData: companyData
          }));
        })
        .finally(() => setIsSaving(false));
    } else {
      const colRef = collection(db, 'delivery-companies');
      addDoc(colRef, { ...companyData, createdAt: serverTimestamp() })
        .then(() => {
          toast({ title: "تمت الإضافة بنجاح", description: `تمت إضافة شركة ${formData.name}` });
          resetForm();
        })
        .catch((error: any) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ 
            path: 'delivery-companies', 
            operation: 'create',
            requestResourceData: companyData
          }));
        })
        .finally(() => setIsSaving(false));
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!db) return;
    if (!window.confirm(`هل أنتِ متأكدة من حذف شركة ${name}؟`)) return;
    
    const docRef = doc(db, 'delivery-companies', id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "تم الحذف", description: "تم مسح بيانات الشركة بنجاح" });
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
      });
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', apiUrl: '', isActive: true });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (company: any) => {
    setFormData({
      name: company.name,
      phone: company.phone || '',
      apiUrl: company.apiUrl || '',
      isActive: company.isActive ?? true
    });
    setEditingId(company.id);
    setIsAdding(true);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#050505] text-foreground font-arabic transition-colors" dir="rtl">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary dark:text-zinc-500">الشركاء اللوجستيين</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary dark:text-zinc-100">شركات التوصيل</h1>
            </div>
            
            {!isAdding && (
              <Button 
                onClick={() => setIsAdding(true)} 
                className="h-12 px-8 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="ml-2 h-5 w-5" />
                إضافة شركة شحن
              </Button>
            )}
          </div>

          {isAdding && (
            <div className="nova-card p-10 mb-12 border border-primary/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-premium animate-in fade-in zoom-in-95 transition-all">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-secondary" />
                  <h3 className="text-xl font-black text-primary dark:text-zinc-100">{editingId ? 'تعديل بيانات الشركة' : 'شركة توصيل جديدة'}</h3>
                </div>
                <button onClick={resetForm} className="text-primary/20 dark:text-zinc-700 hover:text-primary dark:hover:text-zinc-300 transition-colors p-2 rounded-full hover:bg-accent dark:hover:bg-zinc-800"><X className="h-6 w-6" /></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">اسم الشركة *</Label>
                  <Input 
                    placeholder="مثلاً: شركة النور للتوصيل"
                    className="h-14 bg-accent/30 dark:bg-zinc-800 border-none rounded-xl font-bold dark:text-zinc-100 focus:ring-2 focus:ring-primary/20"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">رقم الهاتف</Label>
                  <Input 
                    placeholder="0770 000 0000"
                    className="h-14 bg-accent/30 dark:bg-zinc-800 border-none rounded-xl font-bold dir-ltr dark:text-zinc-100 text-right focus:ring-2 focus:ring-primary/20"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-primary/40 dark:text-zinc-500 uppercase">رابط الـ API (إن وجد)</Label>
                  <Input 
                    placeholder="https://api.delivery.com"
                    className="h-14 bg-accent/30 dark:bg-zinc-800 border-none rounded-xl font-bold dir-ltr dark:text-zinc-100 focus:ring-2 focus:ring-primary/20"
                    value={formData.apiUrl}
                    onChange={(e) => setFormData({...formData, apiUrl: e.target.value})}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-end lg:col-span-3 pt-4">
                  <Button 
                    className="w-full md:w-auto px-12 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Save className="ml-2 h-5 w-5" />}
                    حفظ بيانات الشركة
                  </Button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center font-black animate-pulse text-primary/20 dark:text-zinc-800 text-lg">جاري تحميل القائمة الملكية...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companies?.map((company: any) => (
                <div key={company.id} className="nova-card p-8 bg-white dark:bg-zinc-900 border border-border dark:border-zinc-800 shadow-sm group hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-accent dark:bg-zinc-800 rounded-xl flex items-center justify-center text-primary dark:text-zinc-100 border border-border dark:border-zinc-800 group-hover:bg-primary/5 transition-colors">
                        <Truck className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-primary dark:text-zinc-100 text-lg">{company.name}</h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${company.isActive ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                          {company.isActive ? 'نشطة' : 'معطلة'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(company)} className="p-2 text-primary/20 dark:text-zinc-700 hover:text-primary dark:hover:text-zinc-300 hover:bg-accent dark:hover:bg-zinc-800 rounded-lg transition-all"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(company.id, company.name)} className="p-2 text-primary/20 dark:text-zinc-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  {company.phone && (
                    <div className="flex items-center gap-2 text-sm font-bold text-primary/60 dark:text-zinc-500 dir-ltr justify-end">
                      {company.phone} <Phone className="h-3 w-3 text-secondary" />
                    </div>
                  )}
                </div>
              ))}
              {companies?.length === 0 && (
                <div className="col-span-full py-32 text-center opacity-20 dark:opacity-10 text-primary dark:text-zinc-100 border-4 border-dashed border-accent dark:border-zinc-800 rounded-[3rem] transition-colors">
                  <Truck className="h-20 w-20 mx-auto mb-6" />
                  <p className="font-black text-xl">لا توجد شركات توصيل مضافة حالياً</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
