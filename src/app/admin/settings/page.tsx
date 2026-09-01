
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadButton } from '@/components/ui/image-upload-button';
import { 
  Settings as SettingsIcon, 
  Save, 
  MessageCircle, 
  Instagram, 
  Facebook,
  Truck, 
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
    storeName: 'NOVA', logo: '', whatsapp: '', instagram: '', facebook: '', tiktok: '',
    returnPolicy: '', deliveryFees: {}, lowStockThreshold: 5
  });

  useEffect(() => { if (settings) setFormData({ ...formData, ...settings }); }, [settings]);

  const handleSave = async () => {
    await setDoc(settingsRef, { ...formData, storeId: 'nova-official', updatedAt: new Date().toISOString() }, { merge: true });
    toast({ title: "تم الحفظ بنجاح" });
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري التحميل...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
      <AdminHeader />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black gold-text">إعدادات النظام</h1>
            <p className="text-white/40 text-sm mt-1">تخصيص هوية وسياسات متجر NOVA</p>
          </div>
          <Button onClick={handleSave} className="h-12 px-8 rounded-2xl bg-primary text-black font-black transition-all hover:scale-105">
            <Save className="ml-2 h-5 w-5" /> حفظ التغييرات
          </Button>
        </div>

        <div className="space-y-12">
          {/* Identity */}
          <section className="nova-card p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3"><ImageIcon className="h-5 w-5 text-primary" /> الهوية</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-white/40 uppercase">اسم المتجر</Label>
                  <Input value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative h-32 w-32 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden celestial-glow">
                {formData.logo ? <Image src={formData.logo} alt="Logo" fill className="object-contain p-4" /> : <ImageIcon className="h-12 w-12 text-white/10" />}
              </div>
              <ImageUploadButton onUploadComplete={(url) => setFormData({...formData, logo: url})} label="تغيير الشعار" />
            </div>
          </section>

          {/* Social */}
          <section className="nova-card p-10 space-y-8">
            <h3 className="text-xl font-black flex items-center gap-3"><Share2 className="h-5 w-5 text-primary" /> قنوات التواصل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-white/40 uppercase flex items-center gap-2"><MessageCircle className="h-3 w-3" /> WhatsApp</Label>
                <Input value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="bg-white/5 border-white/10 rounded-xl dir-ltr" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-white/40 uppercase flex items-center gap-2"><Instagram className="h-3 w-3" /> Instagram</Label>
                <Input value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} className="bg-white/5 border-white/10 rounded-xl dir-ltr" />
              </div>
            </div>
          </section>

          {/* Policy */}
          <section className="nova-card p-10 space-y-4">
            <h3 className="text-xl font-black flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /> سياسة الاستبدال</h3>
            <Textarea value={formData.returnPolicy} onChange={(e) => setFormData({...formData, returnPolicy: e.target.value})} className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl p-6" />
          </section>
        </div>
      </main>
    </div>
  );
}
