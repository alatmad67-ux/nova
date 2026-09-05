
"use client";

import React, { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Trash2, Edit, Check, X, ChevronRight, Loader2, Home, Briefcase, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { IRAQI_GOVERNORATES, STORE_ID } from '@/lib/constants';
import { cn } from "@/lib/utils";

export default function AddressesPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: 'المنزل',
    governorate: 'بغداد',
    area: '',
    street: '',
    nearestLandmark: '',
    isDefault: false
  });

  const addrQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'addresses'), where('storeId', '==', STORE_ID));
  }, [db, user]);

  const { data: addresses, loading: dataLoading } = useCollection(addrQuery);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setLoading(true);
    try {
      const colRef = collection(db, 'users', user.uid, 'addresses');
      
      // If setting as default, clear others
      if (formData.isDefault && addresses) {
        for (const addr of addresses) {
          if (addr.isDefault) await updateDoc(doc(db, 'users', user.uid, 'addresses', addr.id), { isDefault: false });
        }
      }

      await addDoc(colRef, {
        ...formData,
        storeId: STORE_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast({ title: "تم الحفظ", description: "تمت إضافة العنوان بنجاح" });
      setIsAdding(false);
      setFormData({ label: 'المنزل', governorate: 'بغداد', area: '', street: '', nearestLandmark: '', isDefault: false });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ العنوان" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !user || !confirm('هل أنتِ متأكدة من حذف هذا العنوان؟')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'addresses', id));
      toast({ title: "تم الحذف" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحذف" });
    }
  };

  return (
    <div className="min-h-screen bg-background font-arabic pb-32">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full bg-accent text-primary">
              <ChevronRight className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-black text-primary">عناوين التوصيل</h1>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm" className="rounded-xl bg-primary text-white font-bold gap-2">
              <Plus className="h-4 w-4" /> إضافة جديد
            </Button>
          )}
        </div>

        {isAdding && (
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] p-8 border border-border shadow-premium mb-8 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-primary">إضافة عنوان جديد</h3>
              <button type="button" onClick={() => setIsAdding(false)}><X className="h-5 w-5 text-primary/20" /></button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {['المنزل', 'العمل', 'أخرى'].map(l => (
                  <button 
                    key={l} 
                    type="button"
                    onClick={() => setFormData({...formData, label: l})}
                    className={cn(
                      "h-12 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2",
                      formData.label === l ? "border-primary bg-primary/5 text-primary" : "border-border text-primary/20"
                    )}
                  >
                    {l === 'المنزل' && <Home className="h-3 w-3" />}
                    {l === 'العمل' && <Briefcase className="h-3 w-3" />}
                    {l === 'أخرى' && <Info className="h-3 w-3" />}
                    {l}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pr-2">المحافظة</Label>
                <select 
                  className="w-full h-12 px-4 bg-accent/30 border border-border rounded-xl text-primary font-bold outline-none"
                  value={formData.governorate}
                  onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                >
                  {IRAQI_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pr-2">المنطقة / الحي</Label>
                <Input 
                  value={formData.area} 
                  onChange={(e) => setFormData({...formData, area: e.target.value})} 
                  placeholder="مثلاً: المنصور، الداودي"
                  className="h-12 bg-accent/30 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest pr-2">الشارع وأقرب نقطة دالة</Label>
                <Input 
                  value={formData.street} 
                  onChange={(e) => setFormData({...formData, street: e.target.value})} 
                  placeholder="رقم الدار، اسم الشارع، نقطة دالة"
                  className="h-12 bg-accent/30 rounded-xl"
                  required
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="isDefault" 
                  className="h-5 w-5 rounded-lg border-primary accent-primary" 
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                />
                <Label htmlFor="isDefault" className="text-sm font-bold text-primary/60 cursor-pointer">تعيين كعنوان افتراضي</Label>
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-black shadow-lg" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ العنوان"}
              </Button>
            </div>
          </form>
        )}

        {dataLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-accent animate-pulse rounded-[2rem]" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {addresses?.map((addr: any) => (
              <div key={addr.id} className={cn(
                "bg-white rounded-[2rem] p-6 border transition-all relative group",
                addr.isDefault ? "border-primary/30 shadow-md" : "border-border shadow-sm"
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center text-primary">
                      {addr.label === 'المنزل' ? <Home className="h-5 w-5" /> : addr.label === 'العمل' ? <Briefcase className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-black text-primary">{addr.label}</h4>
                      {addr.isDefault && <span className="text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-full uppercase">افتراضي</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(addr.id)} className="p-2 text-primary/10 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-sm text-primary/60 font-bold leading-relaxed">
                  <p>{addr.governorate} - {addr.area}</p>
                  <p className="text-xs opacity-70 mt-1">{addr.street}</p>
                </div>
              </div>
            ))}
            {addresses?.length === 0 && !isAdding && (
              <div className="text-center py-20 bg-accent/20 rounded-[3rem] border-2 border-dashed border-primary/5">
                <MapPin className="h-12 w-12 text-primary/10 mx-auto mb-4" />
                <p className="text-primary/40 font-bold">لا توجد عناوين محفوظة بعد</p>
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
