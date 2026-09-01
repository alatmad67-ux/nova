
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
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
  Globe, 
  Key,
  ShieldCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

export default function DeliveryCompaniesPage() {
  const db = useFirestore();
  const companiesQuery = useMemo(() => query(collection(db, 'delivery-companies')), [db]);
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

  const handleSave = async () => {
    if (!formData.name) {
      toast({ variant: "destructive", title: "خطأ", description: "اسم الشركة مطلوب" });
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'delivery-companies', editingId), formData);
        toast({ title: "تم التحديث", description: "تم تحديث بيانات الشركة بنجاح" });
      } else {
        await addDoc(collection(db, 'delivery-companies'), formData);
        toast({ title: "تمت الإضافة", description: "تمت إضافة شركة التوصيل الجديدة" });
      }
      resetForm();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ بيانات الشركة" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذه الشركة؟')) return;
    try {
      await deleteDoc(doc(db, 'delivery-companies', id));
      toast({ title: "تم الحذف", description: "تم حذف الشركة بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حذف الشركة" });
    }
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

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black animate-pulse">جاري تحميل شركات التوصيل...</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">الخدمات اللوجستية</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary">شركات التوصيل</h1>
            </div>
            
            <Button 
              onClick={() => setIsAdding(true)} 
              className="h-12 px-8 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="ml-2 h-5 w-5" />
              إضافة شركة شحن
            </Button>
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

                <div className="flex items-end gap-4">
                  <Button className="w-full h-12 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20" onClick={handleSave}>
                    <Save className="ml-2 h-4 w-4" />
                    حفظ الشركة
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
              </div>
            ))}

            {companies?.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-20 text-primary">
                <Truck className="h-16 w-16 mx-auto mb-4" />
                <p className="font-black">لا توجد شركات توصيل مضافة بعد</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
