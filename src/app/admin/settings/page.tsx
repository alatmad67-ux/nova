
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Save, 
  MessageCircle, 
  Instagram, 
  Truck, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PROVINCES = [
  "بغداد", "البصرة", "نينوى", "أربيل", "النجف", "كربلاء", "ذي قار", "بابل", "الأنبار", "كركوك", "ديالى", "صلاح الدين", "المثنى", "القادسية", "ميسان", "واسط", "السليمانية", "دهوك"
];

export default function AdminSettingsPage() {
  const db = useFirestore();
  const settingsRef = useMemo(() => doc(db, 'settings', 'general'), [db]);
  const { data: settings, loading } = useDoc(settingsRef);

  const [formData, setFormData] = useState<any>({
    storeName: 'NOVA',
    whatsapp: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      tiktok: ''
    },
    deliveryFees: {},
    lowStockThreshold: 5
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        ...formData,
        ...settings,
        deliveryFees: settings.deliveryFees || {}
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await setDoc(settingsRef, formData, { merge: true });
      toast({ title: "تم الحفظ", description: "تم تحديث إعدادات NOVA بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ الإعدادات" });
    }
  };

  const updateDeliveryFee = (province: string, fee: number) => {
    setFormData({
      ...formData,
      deliveryFees: {
        ...formData.deliveryFees,
        [province]: fee
      }
    });
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري تحميل الإعدادات الملكية...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-5 w-5 text-primary" />
              <span className="text-xs font-black tracking-widest uppercase text-primary">إدارة النظام</span>
            </div>
            <h1 className="text-4xl font-black gold-text">إعدادات المتجر</h1>
          </div>
          
          <Button 
            onClick={handleSave} 
            className="h-12 px-8 rounded-2xl bg-primary text-black font-black hover:scale-105 transition-all"
          >
            <Save className="ml-2 h-5 w-5" />
            حفظ التغييرات
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* General Info */}
          <section className="nova-card p-10 space-y-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <Settings className="h-5 w-5 text-primary" />
              المعلومات الأساسية
            </h3>
            
            <div className="space-y-4">
              <Label className="text-xs font-black text-white/40 uppercase">رقم واتساب الطلبات</Label>
              <Input 
                placeholder="9647700000000"
                className="h-12 bg-white/5 border-white/10 rounded-xl dir-ltr"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-xs font-black text-white/40 uppercase">رابط انستغرام</Label>
                <Input 
                  placeholder="instagram.com/nova"
                  className="h-12 bg-white/5 border-white/10 rounded-xl dir-ltr"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})}
                />
              </div>
              <div className="space-y-4">
                <Label className="text-xs font-black text-white/40 uppercase">حد المخزون المنخفض</Label>
                <Input 
                  type="number"
                  className="h-12 bg-white/5 border-white/10 rounded-xl text-center font-black"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({...formData, lowStockThreshold: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </section>

          {/* Delivery Fees */}
          <section className="nova-card p-10 space-y-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              أجور التوصيل حسب المحافظة
            </h3>
            
            <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-4 pr-2">
              {PROVINCES.map(p => (
                <div key={p} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                  <span className="font-bold text-white">{p}</span>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="number"
                      placeholder="السعر"
                      className="w-32 h-10 bg-black/40 border-white/5 rounded-lg text-center font-black text-primary"
                      value={formData.deliveryFees[p] || ''}
                      onChange={(e) => updateDeliveryFee(p, parseInt(e.target.value))}
                    />
                    <span className="text-[10px] text-white/40 font-bold uppercase">د.ع</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <p className="text-xs text-white/60 font-light leading-relaxed">
                سيتم استخدام هذه الأسعار تلقائياً في صفحة إتمام الطلب للزبائن عند اختيار المحافظة.
              </p>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
