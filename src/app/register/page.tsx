
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Smartphone, Lock, Loader2, ChevronLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { STORE_ID } from '@/lib/constants';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const normalizePhone = (num: string) => {
    let clean = num.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '964' + clean.substring(1);
    if (clean.startsWith('7')) clean = '964' + clean;
    return clean.startsWith('+') ? clean : '+' + clean;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "تنبيه", description: "كلمات المرور غير متطابقة" });
      return;
    }

    setLoading(true);
    try {
      const normalized = normalizePhone(formData.phone);
      const virtualEmail = `${normalized}@nova-auth.local`;
      
      const result = await createUserWithEmailAndPassword(auth, virtualEmail, formData.password);
      
      await updateProfile(result.user, { displayName: formData.name });

      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        displayName: formData.name,
        phoneNumber: normalized,
        provider: 'phone',
        storeId: STORE_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({ title: "تم إنشاء الحساب", description: "أهلاً بكِ في عالم NOVA ✨" });
      router.push('/account');
    } catch (error: any) {
      let msg = "فشل إنشاء الحساب، يرجى المحاولة لاحقاً";
      if (error.code === 'auth/email-already-in-use') msg = "هذا الرقم مسجل مسبقاً";
      toast({ variant: "destructive", title: "خطأ", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic">
      <header className="h-20 flex items-center px-6 justify-between bg-white border-b border-border/30">
        <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">حساب جديد</h1>
        <div className="w-10" />
      </header>

      <main className="flex-grow p-6 max-w-md mx-auto w-full space-y-8">
        <div className="text-center py-4">
          <h2 className="text-2xl font-black text-primary">انضمي لمجتمعنا</h2>
          <p className="text-sm text-primary/40 font-bold mt-1">ابدأي رحلتكِ مع الأناقة الفاخرة</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-black text-primary/40 uppercase pr-2">الاسم الكامل</Label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20" />
              <Input 
                placeholder="أدخلي اسمكِ الثلاثي" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="h-14 pr-12 bg-accent/30 border-none rounded-2xl font-bold text-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black text-primary/40 uppercase pr-2">رقم الهاتف</Label>
            <div className="relative">
              <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20" />
              <Input 
                placeholder="07xxxxxxxx" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="h-14 pr-12 bg-accent/30 border-none rounded-2xl font-bold text-primary dir-ltr text-right"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black text-primary/40 uppercase pr-2">كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20" />
              <Input 
                type="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="h-14 pr-12 bg-accent/30 border-none rounded-2xl font-bold text-primary dir-ltr text-right"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black text-primary/40 uppercase pr-2">تأكيد كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20" />
              <Input 
                type="password"
                placeholder="••••••••" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="h-14 pr-12 bg-accent/30 border-none rounded-2xl font-bold text-primary dir-ltr text-right"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl bg-primary text-white text-xl font-black shadow-xl shadow-primary/20 mt-4">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "إنشاء حساب"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm font-bold text-primary/40">لديكِ حساب بالفعل؟ <Link href="/login" className="text-primary font-black underline">سجلي دخولكِ</Link></p>
        </div>
      </main>
    </div>
  );
}
