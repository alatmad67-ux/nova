
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { AdminGuard } from '@/components/layout/AdminGuard';
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
  Share2,
  Sparkles,
  Smartphone,
  Globe
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from "@/lib/utils";

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
        ...settings 
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
      toast({ title: "تم الحفظ بنجاح", description: "تم تحديث إعدادات متجر NOVA" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحفظ", description: "فشل تحديث الإعدادات" });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary font-arabic">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="font-black animate-pulse">جاري تحميل إعدادات NOVA...</p>
    </div>
  );

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic">
        <AdminHeader />
        
        <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">تخصيص النظام</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary">إعدادات المتجر</h1>
            </div>
            
            <Button 
              onClick={handleSave} 
              className="h-14 px-10 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              <Save className="ml-2 h-5 w-5" />
              حفظ التغييرات الملكية
            </Button>
          </div>

          <div className="space-y-10">
            {/* Store Identity */}
            <section className="nova-card p-10 bg-white border-border shadow-premium relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary/10" />
              <h3 className="text-xl font-black flex items-center gap-3 text-primary mb-10">
                <Sparkles className="h-5 w-5 text-secondary" />
                الهوية البصرية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-black text-primary/40 uppercase tracking-widest pr-2">اسم المتجر</Label>
                    <Input 
                      value={formData.storeName} 
                      onChange={(e) => setFormData({...formData, storeName: e.target.value})} 
                      className="h-14 bg-accent/30 border-border rounded-2xl text-primary font-black focus:border-primary/50" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black text-primary/40 uppercase tracking-widest pr-2">حد المخزون المنخفض</Label>
                    <Input 
                      type="number"
                      value={formData.lowStockThreshold} 
                      onChange={(e) => setFormData({...formData, lowStockThreshold: parseInt(e.target.value)})} 
                      className="h-14 bg-accent/30 border-border rounded-2xl text-primary font-black focus:border-primary/50" 
                    />
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="relative h-40 w-full max-w-[200px] rounded-[2.5rem] bg-accent/30 border-2 border-dashed border-primary/10 flex items-center justify-center overflow-hidden group">
                    {formData.logo ? (
                      <Image src={formData.logo} alt="Logo" fill className="object-contain p-6 transition-transform group-hover:scale-110" />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-primary/10" />
                    )}
                  </div>
                  <ImageUploadButton 
                    onUploadComplete={(url) => setFormData({...formData, logo: url})} 
                    label="تغيير شعار المتجر"
                    className="w-full max-w-[200px]"
                  />
                </div>
              </div>
            </section>

            {/* Social Channels */}
            <section className="nova-card p-10 bg-white border-border shadow-premium relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-secondary/20" />
              <h3 className="text-xl font-black flex items-center gap-3 text-primary mb-10">
                <Share2 className="h-5 w-5 text-secondary" />
                قنوات التواصل الاجتماعي
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle className="h-3 w-3 text-green-500" /> WhatsApp
                  </Label>
                  <Input 
                    value={formData.whatsapp} 
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} 
                    placeholder="9647XXXXXXXX"
                    className="h-12 bg-accent/30 border-border rounded-xl text-primary font-bold dir-ltr focus:border-primary/50" 
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-2">
                    <Instagram className="h-3 w-3 text-pink-500" /> Instagram
                  </Label>
                  <Input 
                    value={formData.instagram} 
                    onChange={(e) => setFormData({...formData, instagram: e.target.value})} 
                    placeholder="Username"
                    className="h-12 bg-accent/30 border-border rounded-xl text-primary font-bold dir-ltr focus:border-primary/50" 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-2">
                    <Facebook className="h-3 w-3 text-blue-600" /> Facebook
                  </Label>
                  <Input 
                    value={formData.facebook} 
                    onChange={(e) => setFormData({...formData, facebook: e.target.value})} 
                    placeholder="Page Name"
                    className="h-12 bg-accent/30 border-border rounded-xl text-primary font-bold dir-ltr focus:border-primary/50" 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-2">
                    <Smartphone className="h-3 w-3 text-black" /> TikTok
                  </Label>
                  <Input 
                    value={formData.tiktok} 
                    onChange={(e) => setFormData({...formData, tiktok: e.target.value})} 
                    placeholder="@username"
                    className="h-12 bg-accent/30 border-border rounded-xl text-primary font-bold dir-ltr focus:border-primary/50" 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary/40 uppercase tracking-widest flex items-center gap-2">
                    <Globe className="h-3 w-3 text-blue-400" /> Telegram
                  </Label>
                  <Input 
                    value={formData.telegram} 
                    onChange={(e) => setFormData({...formData, telegram: e.target.value})} 
                    placeholder="t.me/channel"
                    className="h-12 bg-accent/30 border-border rounded-xl text-primary font-bold dir-ltr focus:border-primary/50" 
                  />
                </div>
              </div>
            </section>

            {/* Return Policy */}
            <section className="nova-card p-10 bg-white border-border shadow-premium relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
              <h3 className="text-xl font-black flex items-center gap-3 text-primary mb-8">
                <FileText className="h-5 w-5 text-secondary" />
                سياسة الاستبدال والاسترجاع
              </h3>
              <Textarea 
                value={formData.returnPolicy} 
                onChange={(e) => setFormData({...formData, returnPolicy: e.target.value})} 
                placeholder="اكتبي سياسة المتجر هنا لتظهر للزبائن في صفحة المنتج..."
                className="min-h-[200px] bg-accent/30 border-border rounded-[2rem] p-8 text-primary font-medium leading-relaxed focus:border-primary/50" 
              />
            </section>

            <div className="text-center pt-8">
              <p className="text-[10px] text-primary/20 font-black uppercase tracking-[0.4em]">
                نظام إدارة NOVA الرسمي © 2026
              </p>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
