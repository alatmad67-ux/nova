
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Phone, 
  Globe, 
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useStore } from '@/providers/store-provider';

export default function DeliveryCompaniesPage() {
  const db = useFirestore();
  const { storeId } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const companiesQuery = useMemo(() => query(
    collection(db, 'delivery-companies'),
    where('storeId', '==', storeId)
  ), [db, storeId]);
  
  const { data: companies, loading } = useCollection(companiesQuery);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    apiUrl: '',
    apiKey: '',
    apiSecret: '',
    notes: '',
    isActive: true
  });

  const handleSave = () => {
    if (!formData.name) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "اسم الشركة مطلوب" });
      return;
    }

    setIsSaving(true);
    const companyData = {
      ...formData,
      storeId,
      updatedAt: serverTimestamp()
    };

    if (editingId) {
      updateDoc(doc(db, 'delivery-companies', editingId), companyData)
        .then(() => {
          toast({ title: "تم التحديث", description: "تم تحديث بيانات الشركة بنجاح" });
          resetForm();
        })
        .catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `delivery-companies/${editingId}`, operation: 'update' }));
        })
        .finally(() => setIsSaving(false));
    } else {
      addDoc(collection(db, 'delivery-companies'), { ...companyData, createdAt: serverTimestamp() })
        .then(() => {
          toast({ title: "تمت الإضافة", description: "تمت إضافة شركة التوصيل للفاير ستور" });
          resetForm();
        })
        .catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'delivery-companies', operation: 'create' }));
        })
        .finally(() => setIsSaving(false));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذه الشركة من قاعدة البيانات؟')) return;
    deleteDoc(doc(db, 'delivery-companies', id))
      .then(() => {
        toast({ title: "تم الحذف", description: "تم مسح بيانات الشركة نهائياً" });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `delivery-companies/${id}`, operation: 'delete' }));
      });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      apiUrl: '',
      apiKey: '',
      apiSecret: '',
      notes: '',
      isActive: true
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (company: any) => {
    setFormData({
      name: company.name,
      phone: company.phone || '',
      apiUrl: company.apiUrl || '',
      apiKey: company.apiKey || '',
      apiSecret: company.apiSecret || '',
      notes: company.notes || '',
      isActive: company.isActive ?? true
    });
    setEditingId(company.id);
    setIsAdding(true);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black animate-pulse">جاري فحص قائمة الموردين اللوجستيين...</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">شركاء الشحن</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary">شركات التوصيل</h1>
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
            <div className="nova-card p-10 mb-12 border-primary/10 animate-in fade-in zoom-in-95 bg-white shadow-premium">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-primary">{editingId ? 'تعديل بيانات الشركة' : 'شركة توصيل جديدة'}</h3>
                <button onClick={resetForm} className="text-primary/20 hover:text-primary"><X className="h-6 w-6" /></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-primary/40 tracking-widest uppercase">اسم الشركة *</Label>
                  <div className="relative">
                    <Truck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20" />
                    <Input 
                      placeholder="مثلاً: شركة النور للتوصيل"
                      className="h-12 pr-10 bg-accent/30 border-border rounded-xl text-primary font-bold"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-primary/40 tracking-widest uppercase">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20" />
                    <Input 
                      placeholder="0770 000 0000"
                      className="h-12 pr-10 bg-accent/30 border-border rounded-xl text-primary font-bold dir-ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-primary/40 tracking-widest uppercase">رابط الـ API (اختياري)</Label>
                  <div className="relative">
                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20" />
                    <Input 
                      placeholder="https://api.delivery.com"
                      className="h-12 pr-10 bg-accent/30 border-border rounded-xl text-primary font-bold dir-ltr"
                      value={formData.apiUrl}
                      onChange={(e) => setFormData({...formData, apiUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-end gap-4 lg:col-span-3">
                  <Button 
                    className="w-full md:w-auto px-12 h-14 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        جاري الحفظ في Firestore...
                      </>
                    ) : (
                      <>
                        <Save className="ml-2 h-5 w-5" />
                        حفظ بيانات الشركة
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies?.map((company: any) => (
              <div key={company.id} className="nova-card p-8 group hover:border-primary/30 transition-all bg-white shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-accent rounded-2xl flex items-center justify-center border border-border text-primary">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-primary text-xl">{company.name}</h4>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5",
                        company.isActive ? "border-green-100 text-green-600 bg-green-50" : "border-red-100 text-red-600 bg-red-50"
                      )}>
                        {company.isActive ? 'نشطة' : 'معطلة'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(company)} className="p-2 text-primary/20 hover:text-primary transition-colors">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(company.id)} className="p-2 text-primary/20 hover:text-red-500 transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {company.phone && (
                   <p className="text-sm font-bold text-primary/40 dir-ltr flex items-center gap-2">
                     <Phone className="h-3 w-3" />
                     {company.phone}
                   </p>
                )}
              </div>
            ))}

            {companies?.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center opacity-20 text-primary">
                <Truck className="h-16 w-16 mx-auto mb-4" />
                <p className="font-black">لم يتم إضافة أي شركات توصيل لقاعدة البيانات بعد</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
