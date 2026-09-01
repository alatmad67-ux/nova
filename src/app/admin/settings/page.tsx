
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadButton } from '@/components/ui/image-upload-button';
import { 
  Settings, 
  Save, 
  MessageCircle, 
  Instagram, 
  Facebook,
  Twitter,
  Truck, 
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Share2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

const PROVINCES = [
  "بغداد", "البصرة", "نينوى", "أربيل", "النجف", "كربلاء", "ذي قار", "بابل", "الأنبار", "كركوك", "ديالى", "صلاح الدين", "المثنى", "القادسية", "ميسان", "واسط", "السليمانية", "دهوك"
];

export default function AdminSettingsPage() {
  const db = useFirestore();
  const settingsRef = useMemo(() => doc(db, 'settings', 'general'), [db]);
  const { data: settings, loading } = useDoc(settingsRef);

  const [formData, setFormData] = useState<any>({
    storeName: 'NOVA',
    logo: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    snapchat: '',
    telegram: '',
    returnPolicy: '',
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
      await setDoc(settingsRef, {
        ...formData,
        storeId: 'nova-official',
        updatedAt: new Date().toISOString()
      }, { merge: true });
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
              <span className="text-xs font-black tracking-widest uppercase text-primary">إدارة نظام NOVA</span>
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
          {/* Brand & Logo */}
          <section className="nova-card p-10 space-y-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-primary" />
              الهوية والشعار
            </h3>
            
            <div className="flex items-center gap-8">
              <div className="relative h-32 w-32 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden celestial-glow">
                {formData.logo ? (
                  <Image src={formData.logo} alt="Logo" fill className="object-contain p-4" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-white/10" />
                )}
              </div>
              <div className="flex-1 space-y-4">
                <Label className="text-xs font-black text-white/40 uppercase tracking-widest">شعار المتجر</Label>
                <ImageUploadButton 
                  onUploadComplete={(url) => setFormData({...formData, logo: url})}
                  label="تغيير الشعار"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-black text-white/40 uppercase tracking-widest">اسم المتجر</Label>
              <Input 
                value={formData.storeName}
                onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                className="h-12 bg-white/5 border-white/10 rounded-xl font-black"
              />
            </div>
          </section>

          {/* Social Media */}
          <section className="nova-card p-10 space-y-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <Share2 className="h-5 w-5 text-primary" />
              التواصل الاجتماعي
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-white/40 uppercase flex items-center gap-2">
                  <MessageCircle className="h-3 w-3" /> WhatsApp
                </Label>
                <Input 
                  placeholder="96478xxxxxxx"
                  className="bg-white/5 border-white/10 rounded-xl dir-ltr"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-white/40 uppercase flex items-center gap-2">
                  <Instagram className="h-3 w-3" /> Instagram
                </Label>
                <Input 
                  placeholder="nova.fashion"
                  className="bg-white/5 border-white/10 rounded-xl dir-ltr"
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-white/40 uppercase flex items-center gap-2">
                  <Facebook className="h-3 w-3" /> Facebook
                </Label>
                <Input 
                  placeholder="NOVA Fashion"
                  className="bg-white/5 border-white/10 rounded-xl dir-ltr"
                  value={formData.facebook}
                  onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-white/40 uppercase">TikTok</Label>
                <Input 
                  placeholder="nova_fashion_iq"
                  className="bg-white/5 border-white/10 rounded-xl dir-ltr"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({...formData, tiktok: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Return Policy */}
          <section className="nova-card p-10 space-y-8 lg:col-span-2">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              سياسة الاستبدال والخصوصية
            </h3>
            <Textarea 
              value={formData.returnPolicy}
              onChange={(e) => setFormData({...formData, returnPolicy: e.target.value})}
              placeholder="اكتبي هنا سياسة الإرجاع التي ستظهر للزبائن..."
              className="min-h-[200px] bg-white/5 border-white/10 rounded-3xl p-6 leading-relaxed"
            />
          </section>

          {/* Delivery Fees */}
          <section className="nova-card p-10 space-y-8 lg:col-span-2">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              أجور التوصيل الملكية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROVINCES.map(p => (
                <div key={p} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                  <span className="font-bold text-white text-sm">{p}</span>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      placeholder="السعر"
                      className="w-24 h-9 bg-black/40 border-white/5 rounded-lg text-center font-black text-primary"
                      value={formData.deliveryFees[p] || ''}
                      onChange={(e) => updateDeliveryFee(p, e.target.value === '' ? 0 : parseInt(e.target.value))}
                    />
                    <span className="text-[9px] text-white/30 font-bold">د.ع</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
