
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider, 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Lock, Sparkles, ChevronLeft, Loader2, Apple, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { STORE_ID } from '@/lib/constants';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/account';

  useEffect(() => {
    if (user && !userLoading) {
      router.push(redirect);
    }
  }, [user, userLoading, router, redirect]);

  const normalizePhone = (num: string) => {
    let clean = num.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '964' + clean.substring(1);
    if (clean.startsWith('7')) clean = '964' + clean;
    return clean.startsWith('+') ? clean : '+' + clean;
  };

  const syncProfile = async (u: any, provider: string) => {
    if (!db) return;
    const userRef = doc(db, 'users', u.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: u.uid,
        displayName: u.displayName || 'جميلة نوفا',
        email: u.email || '',
        phoneNumber: u.phoneNumber || (provider === 'phone' ? phone : ''),
        photoURL: u.photoURL || '',
        provider: provider,
        storeId: STORE_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !phone || !password) return;
    
    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      const virtualEmail = `${normalized}@nova-auth.local`;
      const result = await signInWithEmailAndPassword(auth, virtualEmail, password);
      await syncProfile(result.user, 'phone');
      toast({ title: "مرحباً بكِ مجدداً", description: "تم تسجيل الدخول بنجاح" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في الدخول", description: "رقم الهاتف أو كلمة المرور غير صحيحة" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await syncProfile(result.user, 'google');
      toast({ title: "مرحباً بكِ", description: "تم تسجيل الدخول عبر Google" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تسجيل الدخول" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic">
      <header className="h-20 flex items-center px-6 justify-between bg-white border-b border-border/30">
        <button onClick={() => router.push('/')} className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">تسجيل الدخول</h1>
        <div className="w-10" />
      </header>

      <main className="flex-grow flex flex-col p-6 max-w-md mx-auto w-full">
        <div className="text-center mb-10 mt-4">
          <div className="inline-flex p-4 bg-primary/5 rounded-3xl mb-6">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-primary mb-2">أهلاً بكِ في NOVA</h2>
          <p className="text-primary/40 font-bold">سجلي دخولكِ لتجربة تسوق ملكية</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-primary/40 uppercase pr-2">رقم الهاتف</Label>
            <div className="relative">
              <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/20" />
              <Input 
                placeholder="07xxxxxxxx" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 pr-12 bg-accent/30 border-none rounded-2xl font-bold text-primary dir-ltr text-right"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl bg-primary text-white text-xl font-black shadow-xl shadow-primary/20">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "دخول"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm font-bold text-primary/40 mb-6">ليس لديكِ حساب؟ <Link href="/register" className="text-primary font-black underline">أنشئي حساباً الآن</Link></p>
          
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-primary/20 font-black">أو عبر</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleGoogleLogin} className="h-14 rounded-2xl border-border hover:bg-accent font-bold gap-3">
              <img src="https://www.gstatic.com/firebase/explore/google.svg" className="h-5 w-5" alt="G" /> Google
            </Button>
            <Button variant="outline" className="h-14 rounded-2xl border-border hover:bg-accent font-bold gap-3">
              <Apple className="h-5 w-5" /> Apple
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
