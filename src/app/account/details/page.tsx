
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Mail, 
  Smartphone, 
  ChevronRight, 
  Camera, 
  Pencil,
  Loader2,
  Check
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

export default function AccountDetailsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  
  const profileRef = useMemo(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || user?.displayName || '',
        email: profile.email || user?.email || '',
        phoneNumber: profile.phoneNumber || user?.phoneNumber || ''
      });
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileRef) return;

    setIsSaving(true);
    try {
      await updateDoc(profileRef, {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        updatedAt: serverTimestamp()
      });
      toast({ title: "تم التحديث", description: "تم حفظ بياناتكِ الملكية بنجاح ✨" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث البيانات، يرجى المحاولة لاحقاً" });
    } finally {
      setIsSaving(false);
    }
  };

  if (userLoading || profileLoading) return (
    <div className="min-h-screen bg-[#fff9f9] flex items-center justify-center text-primary font-black animate-pulse">
      جاري تحضير ملفكِ الشخصي...
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9f9] font-arabic pb-32 relative overflow-hidden">
      {/* Background blobs for artistic touch */}
      <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Custom Header with Back Button */}
      <header className="h-20 flex items-center px-6 justify-between relative z-10">
        <div className="w-10" /> {/* Spacer */}
        <h1 className="text-xl font-black text-primary">تفاصيل الحساب</h1>
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-white shadow-sm border border-primary/5 flex items-center justify-center text-primary"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </header>
      
      <main className="flex-grow container mx-auto px-6 py-4 relative z-10 max-w-md">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full p-1 bg-gradient-to-tr from-primary/20 to-secondary/20 shadow-xl">
              <Avatar className="h-full w-full border-4 border-white">
                <AvatarImage src={profile?.photoURL || user?.photoURL || ''} />
                <AvatarFallback className="bg-primary/5 text-primary text-4xl font-black">
                  {formData.displayName?.[0] || 'N'}
                </AvatarFallback>
              </Avatar>
            </div>
            <button className="absolute bottom-1 right-1 h-9 w-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white hover:scale-110 transition-transform">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Name Field */}
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-primary/5 flex items-center gap-4">
            <div className="flex-grow text-right">
              <Label className="text-[10px] font-black text-primary/30 uppercase tracking-widest block mb-1">الاسم الكامل</Label>
              <Input 
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="border-none bg-transparent h-8 p-0 text-primary font-black focus-visible:ring-0 text-lg"
                placeholder="أدخلي اسمكِ هنا"
              />
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
              <User className="h-5 w-5" />
            </div>
          </div>

          {/* Email Field (Read Only) */}
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-primary/5 flex items-center gap-4 opacity-80">
            <div className="flex-grow text-right">
              <Label className="text-[10px] font-black text-primary/30 uppercase tracking-widest block mb-1">البريد الإلكتروني</Label>
              <p className="text-primary font-black text-lg truncate">{formData.email || 'لا يوجد بريد'}</p>
              <p className="text-[9px] text-primary/20 font-bold mt-1">البريد مرتبط بطريقة تسجيل دخولكِ</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
              <Mail className="h-5 w-5" />
            </div>
          </div>

          {/* Phone Field */}
          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-primary/5 flex items-center gap-4">
            <div className="flex-grow text-right">
              <Label className="text-[10px] font-black text-primary/30 uppercase tracking-widest block mb-1">رقم الهاتف</Label>
              <Input 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="border-none bg-transparent h-8 p-0 text-primary font-black focus-visible:ring-0 text-lg dir-ltr text-right"
                placeholder="07xxxxxxxx"
              />
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
          </div>

          {/* Action Button */}
          <Button 
            type="submit"
            disabled={isSaving}
            className="w-full h-16 rounded-[2rem] bg-primary text-white text-xl font-black mt-10 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all border-b-4 border-black/10"
          >
            {isSaving ? (
              <>
                <Loader2 className="ml-2 h-6 w-6 animate-spin" />
                جاري الحفظ...
              </>
            ) : "حفظ التغييرات"}
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}

