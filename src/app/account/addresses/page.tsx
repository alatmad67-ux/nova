
"use client";

import React, { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Trash2, 
  X, 
  ChevronRight, 
  Loader2, 
  Home, 
  Map, 
  Flag, 
  LocateFixed,
  Plus,
  Smartphone
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { IRAQI_GOVERNORATES, STORE_ID } from '@/lib/constants';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

export default function AddressesPage() {
  const router = useRouter();
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
    phone: '',
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
    
    if (!formData.phone) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى إدخال رقم هاتف للتواصل" });
      return;
    }

    setLoading(true);
    try {
      const colRef = collection(db, 'users', user.uid, 'addresses');
      
      // If this is the first address, or set as default, handle others
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
      
      toast({ title: "تم الحفظ بنجاح ✨", description: "تمت إضافة العنوان الجديد إلى قائمتكِ." });
      setIsAdding(false);
      setFormData({ label: 'المنزل', governorate: 'بغداد', area: '', street: '', nearestLandmark: '', phone: '', isDefault: false });
    } catch (error) {
      console.error("Save address error:", error);
      toast({ variant: "destructive", title: "خطأ في الحفظ", description: "فشل حفظ العنوان، يرجى المحاولة لاحقاً." });
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
    <div className="min-h-screen bg-primary font-arabic pb-32" dir="rtl">
      {/* Header */}
      <header className="h-20 flex items-center px-6 justify-between text-white relative z-10">
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black">العناوين</h1>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-0 max-w-lg">
        {!isAdding ? (
          <div className="px-6 py-4">
             <Button 
              onClick={() => setIsAdding(true)} 
              className="w-full h-16 rounded-[2rem] bg-white/10 text-white border border-white/20 font-black mb-8 gap-3 hover:bg-white/20 transition-all"
            >
              <Plus className="h-5 w-5" /> إضافة عنوان جديد
            </Button>

            <div className="space-y-4">
              {dataLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-[2.5rem]" />)}
                </div>
              ) : addresses?.length === 0 ? (
                <div className="text-center py-20 opacity-30 text-white">
                  <MapPin className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-black">لا توجد عناوين محفوظة</p>
                </div>
              ) : (
                addresses?.map((addr: any) => (
                  <div key={addr.id} className="bg-white rounded-[2.5rem] p-6 border border-border shadow-lg flex items-center justify-between group transition-all hover:scale-[1.02]">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-primary text-lg">{addr.label}</h4>
                        {addr.isDefault && <span className="text-[10px] bg-secondary text-white px-2 py-0.5 rounded-full font-black">افتراضي</span>}
                      </div>
                      <p className="text-sm text-primary/60 font-bold">{addr.governorate} - {addr.area}</p>
                      <p className="text-xs text-primary/40 mt-1">{addr.street}</p>
                      {addr.phone && <p className="text-[10px] text-secondary font-black mt-2 dir-ltr text-right">{addr.phone}</p>}
                    </div>
                    <button onClick={() => handleDelete(addr.id)} className="p-3 text-primary/10 hover:text-red-500 rounded-full transition-colors bg-accent/50">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-t-[3.5rem] min-h-[85vh] p-8 animate-in slide-in-from-bottom-10 duration-500 shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <button type="button" onClick={() => setIsAdding(false)} className="p-2 text-primary/20 hover:text-primary transition-colors">
                <X className="h-7 w-7" />
              </button>
              <h3 className="text-xl font-black text-primary">عنوان التوصيل</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 pr-2">نوع العنوان</Label>
                  <select 
                    className="w-full h-14 px-4 bg-accent/30 border-none rounded-2xl text-primary font-bold appearance-none outline-none"
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                  >
                    <option value="المنزل">المنزل</option>
                    <option value="العمل">العمل</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-primary/40 pr-2">المحافظة</Label>
                  <select 
                    className="w-full h-14 px-4 bg-accent/30 border-none rounded-2xl text-primary font-bold appearance-none outline-none"
                    value={formData.governorate}
                    onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                  >
                    {IRAQI_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-primary/40 pr-2">رقم الهاتف للتواصل *</Label>
                <div className="relative">
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    placeholder="07xxxxxxxx"
                    className="h-14 pr-12 bg-accent/30 border-none rounded-2xl text-primary font-bold text-right focus-visible:ring-1 focus-visible:ring-primary/20 dir-ltr"
                    required
                  />
                  <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-primary/40 pr-2">المنطقة / الحي</Label>
                <div className="relative">
                  <Input 
                    value={formData.area} 
                    onChange={(e) => setFormData({...formData, area: e.target.value})} 
                    placeholder="اسم المنطقة"
                    className="h-14 pr-12 bg-accent/30 border-none rounded-2xl text-primary font-bold text-right"
                    required
                  />
                  <Map className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-primary/40 pr-2">العنوان التفصيلي (الشارع / الزقاق)</Label>
                <div className="relative">
                  <Input 
                    value={formData.street} 
                    onChange={(e) => setFormData({...formData, street: e.target.value})} 
                    placeholder="رقم الدار، رقم البناية..."
                    className="h-14 pr-12 bg-accent/30 border-none rounded-2xl text-primary font-bold text-right"
                    required
                  />
                  <Home className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-primary/40 pr-2">أقرب نقطة دالة</Label>
                <div className="relative">
                  <Input 
                    value={formData.nearestLandmark} 
                    onChange={(e) => setFormData({...formData, nearestLandmark: e.target.value})} 
                    placeholder="مثال: قرب صيدلية النور"
                    className="h-14 pr-12 bg-accent/30 border-none rounded-2xl text-primary font-bold text-right"
                  />
                  <Flag className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                </div>
              </div>

              <div className="py-4">
                <div className="flex items-center gap-3 mb-6">
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    className="h-5 w-5 rounded border-primary/20 accent-primary"
                  />
                  <label htmlFor="isDefault" className="text-xs font-black text-primary/60">تعيين كعنوان افتراضي للتوصيل</label>
                </div>

                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-dashed border-primary/20 text-primary/40 font-black mb-4 gap-3 hover:bg-accent/50"
                >
                  <LocateFixed className="h-5 w-5 text-secondary" />
                  تحديد الموقع على الخريطة (اختياري)
                </Button>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 rounded-[1.5rem] bg-primary text-white text-xl font-black shadow-2xl shadow-primary/20 hover:opacity-90 transition-all border-b-4 border-black/10"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "حفظ العنوان"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
