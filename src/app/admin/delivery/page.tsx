
"use client";

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
  Settings,
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري تحميل شركات التوصيل...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">الخدمات اللوجستية</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black gold-text">شركات التوصيل</h1>
          </div>
          
          <Button 
            onClick={() => setIsAdding(true)} 
            className="h-12 px-8 rounded-2xl bg-primary text-black font-black hover:scale-105 transition-all"
          >
            <Plus className="ml-2 h-5 w-5" />
            إضافة شركة شحن
          </Button>
        </div>

        {isAdding && (
          <div className="nova-card p-10 mb-12 border-primary/20 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white">{editingId ? 'تعديل بيانات الشركة' : 'شركة توصيل جديدة'}</h3>
              <button onClick={resetForm} className="text-white/20 hover:text-white"><X className="h-6 w-6" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-black text-white/40 tracking-widest uppercase">اسم الشركة *</Label>
                <div className="relative">
                  <Truck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input 
                    placeholder="مثلاً: شركة النور للتوصيل"
                    className="h-12 pr-10 bg-white/5 border-white/10 rounded-xl"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black text-white/40 tracking-widest uppercase">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input 
                    placeholder="0770 000 0000"
                    className="h-12 pr-10 bg-white/5 border-white/10 rounded-xl dir-ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black text-white/40 tracking-widest uppercase">رابط الـ API (اختياري)</Label>
                <div className="relative">
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input 
                    placeholder="https://api.delivery.com"
                    className="h-12 pr-10 bg-white/5 border-white/10 rounded-xl dir-ltr"
                    value={formData.apiUrl}
                    onChange={(e) => setFormData({...formData, apiUrl: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black text-white/40 tracking-widest uppercase">API Key</Label>
                <div className="relative">
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    className="h-12 pr-10 bg-white/5 border-white/10 rounded-xl dir-ltr"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black text-white/40 tracking-widest uppercase">API Secret</Label>
                <div className="relative">
                  <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    className="h-12 pr-10 bg-white/5 border-white/10 rounded-xl dir-ltr"
                    value={formData.apiSecret}
                    onChange={(e) => setFormData({...formData, apiSecret: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-3">
                  <Label className="text-xs font-black text-white/40 tracking-widest uppercase">الحالة</Label>
                  <select 
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  >
                    <option value="true" className="bg-slate-900">نشطة</option>
                    <option value="false" className="bg-slate-900">معطلة</option>
                  </select>
                </div>
                <Button className="h-12 px-6 bg-primary text-black font-black rounded-xl" onClick={handleSave}>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies?.map((company: any) => (
            <div key={company.id} className="nova-card p-8 group hover:border-primary/50 transition-all celestial-glow relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-primary">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xl">{company.name}</h4>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                      company.isActive ? "border-green-500/20 text-green-500 bg-green-500/10" : "border-red-500/20 text-red-500 bg-red-500/10"
                    )}>
                      {company.isActive ? 'نشطة' : 'معطلة'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => startEdit(company)} className="p-2 text-white/20 hover:text-primary transition-colors">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(company.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-bold uppercase tracking-widest">رقم الهاتف</span>
                  <span className="text-sm font-black text-white/80">{company.phone || 'غير محدد'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-bold uppercase tracking-widest">نوع الربط</span>
                  <span className={cn(
                    "text-xs font-black",
                    company.apiUrl ? "text-primary" : "text-white/20"
                  )}>
                    {company.apiUrl ? 'تكامل API' : 'إدخال يدوي'}
                  </span>
                </div>
              </div>

              {/* Decorative Orbit */}
              <div className="absolute -bottom-12 -left-12 w-32 h-32 border border-primary/5 rounded-full pointer-events-none" />
            </div>
          ))}

          {companies?.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-20">
              <Truck className="h-16 w-16 mx-auto mb-4" />
              <p className="font-bold">لا توجد شركات توصيل مضافة بعد</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
