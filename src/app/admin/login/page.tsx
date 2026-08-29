
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Lock, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ phone: '', password: '' });

  useEffect(() => {
    // If user is already logged in as the specific admin, redirect
    if (!userLoading && user?.email === '07858833838@novafashion.iq') {
      router.push('/admin/dashboard');
    }
  }, [user, userLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.password) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى إدخال جميع البيانات" });
      return;
    }

    setLoading(true);
    try {
      // Mapping phone to a virtual email for secure Password Auth
      // As specified, the admin phone is 07858833838
      const adminEmail = `${formData.phone}@novafashion.iq`;
      await signInWithEmailAndPassword(auth, adminEmail, formData.password);
      toast({ title: "مرحباً بكِ مجدداً", description: "تم تسجيل الدخول بنجاح" });
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "خطأ في الدخول", description: "رقم الهاتف أو كلمة المرور غير صحيحة" });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">جاري التحقق من الهوية...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-arabic">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md nova-card p-12 celestial-glow border-primary/20">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-primary/10 rounded-full mb-6">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-3xl font-black gold-text mb-2">بوابة الإدارة</h1>
            <p className="text-white/40 text-sm font-light">حصري لمديرة متجر NOVA</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-xs font-black text-white/40 uppercase tracking-widest pr-2">رقم الهاتف</Label>
              <div className="relative group">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="078xxxxxxx" 
                  className="h-14 pr-12 bg-white/5 border-white/10 rounded-2xl text-white font-bold text-left dir-ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black text-white/40 uppercase tracking-widest pr-2">كلمة المرور</Label>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="h-14 pr-12 bg-white/5 border-white/10 rounded-2xl text-white font-bold text-left dir-ltr"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl text-xl font-black bg-primary text-black shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              {loading ? "جاري التحقق..." : "دخول ملكي"}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
              نظام إدارة آمن © 2026 NOVA
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
