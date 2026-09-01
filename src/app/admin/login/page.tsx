
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
import { Sparkles, Lock, Phone, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ phone: '', password: '' });

  // CONSTANTS FIXED AS PER USER REQUIREMENTS
  const ADMIN_PHONE = '07858833838';
  const ADMIN_EMAIL = `${ADMIN_PHONE}@novafashion.iq`;

  useEffect(() => {
    if (!userLoading && user?.email === ADMIN_EMAIL) {
      router.push('/admin/dashboard');
    }
  }, [user, userLoading, router, ADMIN_EMAIL]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phone = formData.phone.trim();
    const password = formData.password.trim();

    if (!phone || !password) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى إدخال جميع البيانات" });
      return;
    }

    if (phone !== ADMIN_PHONE) {
      setError("رقم الهاتف هذا لا يمتلك صلاحيات إدارية");
      toast({ variant: "destructive", title: "دخول غير مصرح", description: "رقم الهاتف غير مخصص للإدارة" });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      toast({ title: "مرحباً بكِ مجدداً", description: "تم تسجيل الدخول بصلاحيات المديرة" });
      router.push('/admin/dashboard');
    } catch (err: any) {
      let message = "كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى";
      setError(message);
      toast({ variant: "destructive", title: "خطأ في الدخول", description: message });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary font-arabic">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="font-black animate-pulse">جاري التحقق من الهوية...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-arabic">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-6 bg-accent/10">
        <div className="w-full max-w-md bg-white border border-border p-12 rounded-[3rem] shadow-premium">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-accent rounded-full mb-6 shadow-xl shadow-primary/5">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-primary mb-2 uppercase tracking-widest">بوابة الإدارة</h1>
            <p className="text-primary/40 text-sm font-black">حصري لمديرة متجر NOVA</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8 bg-red-50 border-red-100 text-red-600 rounded-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-black">خطأ في الدخول</AlertTitle>
              <AlertDescription className="text-xs font-bold">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-xs font-black text-primary/40 uppercase tracking-widest pr-2">رقم الهاتف</Label>
              <div className="relative group">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="07858833838" 
                  className="h-14 pr-12 bg-accent/30 border-border rounded-2xl text-primary font-black text-left dir-ltr focus:border-primary/50"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black text-primary/40 uppercase tracking-widest pr-2">كلمة المرور</Label>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="h-14 pr-12 bg-accent/30 border-border rounded-2xl text-primary font-black text-left dir-ltr focus:border-primary/50"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-full text-xl font-black bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              {loading ? "جاري التحقق..." : "دخول ملكي"}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-primary/20 font-black uppercase tracking-[0.2em]">
              نظام إدارة آمن © 2026 NOVA
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
