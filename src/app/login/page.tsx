
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Mail, Sparkles, ChevronLeft, Loader2, Apple } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { STORE_ID } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  
  const [step, setStep] = useState<'method' | 'phone' | 'otp'>('method');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const redirect = searchParams.get('redirect') || '/account';

  useEffect(() => {
    if (user && !userLoading) {
      router.push(redirect);
    }
  }, [user, userLoading, router, redirect]);

  const syncProfile = async (u: any) => {
    if (!db) return;
    const userRef = doc(db, 'users', u.uid);
    await setDoc(userRef, {
      uid: u.uid,
      displayName: u.displayName || 'عميل نوفا',
      email: u.email || '',
      phoneNumber: u.phoneNumber || '',
      photoURL: u.photoURL || '',
      provider: u.providerData[0]?.providerId || 'phone',
      storeId: STORE_ID,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await syncProfile(result.user);
      toast({ title: "مرحباً بكِ", description: "تم تسجيل الدخول عبر Google بنجاح" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تسجيل الدخول عبر Google" });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      await syncProfile(result.user);
      toast({ title: "مرحباً بكِ", description: "تم تسجيل الدخول عبر Apple بنجاح" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تسجيل الدخول عبر Apple. تأكدي من إعدادات الخدمة." });
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.startsWith('+964')) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى إدخال الرقم بصيغة +964" });
      return;
    }
    setLoading(true);
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(result);
      setStep('otp');
      toast({ title: "تم الإرسال", description: "وصلك رمز التحقق الآن" });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال الرمز. تأكدي من الرقم." });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      await syncProfile(result.user);
      toast({ title: "تم الدخول", description: "مرحباً بكِ في عالم NOVA" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "رمز خاطئ", description: "يرجى التأكد من الرمز المدخل" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-border rounded-[3rem] p-8 md:p-12 shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div id="recaptcha-container"></div>

          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-accent rounded-full mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-primary mb-2">انضمي إلينا</h1>
            <p className="text-primary/40 text-sm font-medium">سجلي الدخول لتجربة تسوق ملكية</p>
          </div>

          {step === 'method' && (
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleLogin} 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-border hover:bg-accent flex gap-4 font-bold text-primary"
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebase/explore/google.svg" className="h-5 w-5" alt="G" />
                الدخول عبر Google
              </Button>
              <Button 
                onClick={handleAppleLogin} 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-border hover:bg-accent flex gap-4 font-bold text-primary"
                disabled={loading}
              >
                <Apple className="h-5 w-5" />
                الدخول عبر Apple
              </Button>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-primary/20 font-black">أو</span></div>
              </div>
              <Button 
                onClick={() => setStep('phone')} 
                className="w-full h-14 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 flex gap-4"
                disabled={loading}
              >
                <Smartphone className="h-5 w-5" />
                رقم الهاتف (SMS)
              </Button>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black text-primary/40 uppercase pr-2">رقم الهاتف</Label>
                <Input 
                  placeholder="+964 780 000 0000" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 bg-accent/30 border-border rounded-2xl text-primary font-black dir-ltr text-center focus:border-primary/50"
                  disabled={loading}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-black" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "إرسال الرمز"}
              </Button>
              <button type="button" onClick={() => setStep('method')} className="w-full text-xs font-bold text-primary/40 hover:text-primary flex items-center justify-center gap-2">
                <ChevronLeft className="h-4 w-4" /> العودة للخلف
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black text-primary/40 uppercase pr-2">رمز التحقق</Label>
                <Input 
                  placeholder="000000" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-14 bg-accent/30 border-border rounded-2xl text-primary font-black tracking-[1em] text-center focus:border-primary/50"
                  disabled={loading}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-black" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "تأكيد الرمز"}
              </Button>
              <button type="button" onClick={() => setStep('phone')} className="w-full text-xs font-bold text-primary/40 hover:text-primary flex items-center justify-center gap-2">
                <ChevronLeft className="h-4 w-4" /> تغيير الرقم
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
