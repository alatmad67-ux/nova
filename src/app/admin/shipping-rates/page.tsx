
"use client";

import React, { useMemo, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Save, Loader2, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { IRAQI_GOVERNORATES, STORE_ID } from '@/lib/constants';
import { Switch } from "@/components/ui/switch";

export default function AdminShippingRatesPage() {
  const db = useFirestore();
  const [savingId, setSavingId] = useState<string | null>(null);

  const ratesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'shipping-rates'), where('storeId', '==', STORE_ID));
  }, [db]);

  const { data: rawRates, loading } = useCollection(ratesQuery);

  const ratesMap = useMemo(() => {
    const map: Record<string, any> = {};
    rawRates?.forEach(r => map[r.governorate] = r);
    return map;
  }, [rawRates]);

  const handleUpdate = async (gov: string, price: number, active: boolean) => {
    if (!db) return;
    setSavingId(gov);
    try {
      const rateRef = doc(db, 'shipping-rates', `${STORE_ID}_${gov}`);
      await setDoc(rateRef, {
        governorate: gov,
        price: price,
        isActive: active,
        storeId: STORE_ID,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "تم التحديث", description: `تم حفظ إعدادات ${gov}` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث البيانات" });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background font-arabic">
        <AdminHeader />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-widest uppercase text-primary">إدارة التوصيل</span>
              </div>
              <h1 className="text-4xl font-black text-primary">أسعار الشحن للمحافظات</h1>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-border shadow-premium overflow-hidden">
            <div className="p-6 bg-accent/50 border-b border-border flex items-center justify-between px-10">
              <span className="text-xs font-black text-primary/40 uppercase">المحافظة</span>
              <div className="flex gap-20">
                <span className="text-xs font-black text-primary/40 uppercase">السعر (د.ع)</span>
                <span className="text-xs font-black text-primary/40 uppercase">الحالة</span>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center font-black animate-pulse text-primary/20">جاري تحميل الأسعار...</div>
            ) : (
              <div className="divide-y divide-border/50">
                {IRAQI_GOVERNORATES.map(gov => {
                  const rate = ratesMap[gov] || { price: 5000, isActive: true };
                  return (
                    <div key={gov} className="flex flex-col md:flex-row md:items-center justify-between p-6 px-10 hover:bg-accent/20 transition-colors">
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center text-primary font-black text-xs">
                          {gov[0]}
                        </div>
                        <span className="font-bold text-primary">{gov}</span>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="relative">
                          <Input 
                            type="number"
                            defaultValue={rate.price}
                            className="w-32 h-11 bg-accent/30 rounded-xl font-black text-primary text-center pr-2"
                            id={`price-${gov}`}
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <Switch 
                            defaultChecked={rate.isActive}
                            id={`active-${gov}`}
                          />
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-11 w-11 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-md"
                            disabled={savingId === gov}
                            onClick={() => {
                              const p = parseInt((document.getElementById(`price-${gov}`) as HTMLInputElement).value);
                              const a = (document.getElementById(`active-${gov}`) as any).dataset.state === 'checked';
                              handleUpdate(gov, p, a);
                            }}
                          >
                            {savingId === gov ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
