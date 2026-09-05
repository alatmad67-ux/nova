
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
  Plus
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
      toast({ title: "تم الحفظ", description: "تمت إضافة العنوان بنجاح ✨" });
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
    <div className="min-h-screen bg-[#3d3333] font-arabic pb-32">
      {/* Main Header - Matches Image Style */}
      <header className="h-20 flex items-center px-6 justify-between text-white relative z-10">
        <div className="w-10" /> {/* Spacer */}
        <h1 className="text-xl font-bold">العناوين</h1>
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 flex items-center justify-center"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </header>

      <main className="container mx-auto px-0 max-w-lg">
        {/* If not adding, show list and "Add" button */}
        {!isAdding ? (
          <div className="px-6 py-4">
             <Button 
              onClick={() => setIsAdding(true)} 
              className="w-full h-16 rounded-[2rem] bg-white/10 text-white border border-white/20 font-black mb-8 gap-3"
            >
              <Plus className="h-5 w-5" /> إضافة عنوان جديد
            </Button>

            <div className="space-y-4">
              {dataLoading ? (
                <div className="h-32 bg-white/5 animate-pulse rounded-[2.5rem]" />
              ) : (
                addresses?.map((addr: any) => (
                  <div key={addr.id} className="bg-white rounded-[2.5rem] p-6 border border-border shadow-sm flex items-center justify-between">
                    <div className="text-right">
                      <h4 className="font-black text-primary text-lg">{addr.label}</h4>
                      <p className="text-sm text-primary/60 font-bold">{addr.governorate} - {addr.area}</p>
                      <p className="text-xs text-primary/40 mt-1">{addr.street}</p>
                    </div>
                    <button onClick={() => handleDelete(addr.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* The "Add Address" Form - Matches Image Panel */
          <div className="bg-white rounded-t-[3rem] min-h-[85vh] p-8 animate-in slide-in-from-bottom-10 duration-500 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <button type="button" onClick={() => setIsAdding(false)} className="p-2 text-primary/20">
                <X className="h-7 w-7" />
              </button>
              <h3 className="text-xl font-black text-primary">عنوان التوصيل</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              {/* المحافظة */}
              <div className="space-y-3">
                <Label className="text-sm font-bold text-primary/80 pr-2 block text-right">المحافظة</Label>
                <div className="relative">
                  <select 
                    className="w-full h-16 px-12 bg-accent/30 border-none rounded-[1.5rem] text-primary font-bold appearance-none outline-none text-right"
                    value={formData.governorate}
                    onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                  >
                    {IRAQI_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                  <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20 rotate-90" />
                </div>
              </div>

              {/* المنطقة / الحي */}
              <div className="space-y-3">
                <Label className="text-sm font-bold text-primary/80 pr-2 block text-right">المنطقة / الحي</Label>
                <div className="relative">
                  <Input 
                    value={formData.area} 
                    onChange={(e) => setFormData({...formData, area: e.target.value})} 
                    placeholder="اسم المنطقة"
                    className="h-16 pr-12 bg-accent/30 border-none rounded-[1.5rem] text-primary font-bold text-right focus-visible:ring-0"
                    required
                  />
                  <Map className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-800/60" />
                </div>
              </div>

              {/* العنوان التفصيلي */}
              <div className="space-y-3">
                <Label className="text-sm font-bold text-primary/80 pr-2 block text-right">العنوان التفصيلي</Label>
                <div className="relative">
                  <Input 
                    value={formData.street} 
                    onChange={(e) => setFormData({...formData, street: e.target.value})} 
                    placeholder="الشارع، رقم البناية، الطابق..."
                    className="h-16 pr-12 bg-accent/30 border-none rounded-[1.5rem] text-primary font-bold text-right focus-visible:ring-0"
                    required
                  />
                  <Home className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-800/60" />
                </div>
              </div>

              {/* أقرب نقطة دالة */}
              <div className="space-y-3">
                <Label className="text-sm font-bold text-primary/80 pr-2 block text-right">أقرب نقطة دالة</Label>
                <div className="relative">
                  <Input 
                    value={formData.nearestLandmark} 
                    onChange={(e) => setFormData({...formData, nearestLandmark: e.target.value})} 
                    placeholder="مثال: مقابل صيدلية النور"
                    className="h-16 pr-12 bg-accent/30 border-none rounded-[1.5rem] text-primary font-bold text-right focus-visible:ring-0"
                  />
                  <Flag className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                </div>
              </div>

              {/* موقع التوصيل على الخريطة */}
              <div className="space-y-3">
                <Label className="text-sm font-bold text-primary/80 pr-2 block text-right">موقع التوصيل على الخريطة</Label>
                <button type="button" className="w-full h-16 px-12 bg-accent/30 rounded-[1.5rem] flex items-center justify-between text-primary/40 font-bold">
                  <LocateFixed className="h-5 w-5 text-red-500" />
                  <span>حدّدي موقعكِ على الخريطة</span>
                  <div className="w-5" />
                </button>
              </div>

              {/* حفظ العنوان */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 rounded-[1.5rem] bg-[#d32f2f] text-white text-xl font-bold shadow-xl shadow-red-500/10 hover:bg-red-700 transition-all"
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
