
"use client";

import React, { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useDoc, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { BottomNav } from '@/components/layout/BottomNav';
import { 
  User, 
  MapPin, 
  Heart, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Moon,
  ReceiptText,
  MessageSquare,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

export default function AccountPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const profileRef = useMemo(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    // Check initial dark mode state
    const savedMode = localStorage.getItem('nova_theme');
    if (savedMode === 'dark' || (typeof window !== 'undefined' && document.documentElement.classList.contains('dark'))) {
      setIsDarkMode(true);
    }
  }, [user, loading, router]);

  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nova_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nova_theme', 'light');
    }
  };

  const isAdmin = useMemo(() => {
    const email = user?.email?.toLowerCase() || '';
    return email === '07858833838@novafashion.iq' || email === '+9647858833838@nova-auth.local';
  }, [user]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-[#fff9f9] dark:bg-black flex items-center justify-center text-primary font-black animate-pulse">
      جاري تحميل عالمكِ الخاص...
    </div>
  );

  const MENU_ITEMS = [
    { label: "الطلبات", icon: ReceiptText, href: "/account/orders" },
    { label: "العناوين", icon: MapPin, href: "/account/addresses" },
    { label: "المفضلة", icon: Heart, href: "/wishlist" },
  ];

  const SECONDARY_MENU = [
    { label: "الإشعارات", icon: Bell, href: "/account/notifications" },
    { label: "إعدادات الحساب", icon: Settings, href: "/account/details" },
    { label: "عن NOVA", icon: Sparkles, href: "/about" },
    { label: "المساعدة والدعم", icon: MessageSquare, href: "/support" },
  ];

  const TRACKING_STEPS = [
    { label: 'قيد الانتظار', icon: Clock },
    { label: 'قيد التجهيز', icon: Package },
    { label: 'في الطريق', icon: Truck },
    { label: 'تم التسليم', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9f9] dark:bg-[#050505] font-arabic pb-32 relative overflow-hidden" dir="rtl">
      {/* Aesthetic Background Blobs */}
      <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <main className="flex-grow container mx-auto px-5 py-6 relative z-10 max-w-lg">
        
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-premium dark:shadow-none flex items-center justify-between mb-8 border border-transparent dark:border-zinc-800 transition-all">
           <div className="flex items-center gap-5 text-right">
             <div className="relative">
                <Avatar className="h-16 w-16 border-4 border-accent dark:border-zinc-800 shadow-sm">
                  <AvatarImage src={profile?.photoURL || user.photoURL || ''} />
                  <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">
                    {profile?.displayName?.[0] || user.displayName?.[0] || 'N'}
                  </AvatarFallback>
                </Avatar>
             </div>
              <div className="text-right">
                <h2 className="text-xl font-black text-primary dark:text-zinc-100">
                  {profile?.displayName || user.displayName || 'جميلة نوفا'}
                </h2>
                <p className="text-[10px] text-primary/30 dark:text-zinc-500 font-bold dir-ltr text-right mt-1">
                  {user.phoneNumber || user.email}
                </p>
              </div>
           </div>
           <button onClick={() => router.push('/')} className="h-12 w-12 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary/20 dark:text-zinc-600 hover:bg-primary/5 transition-all">
             <ChevronLeft className="h-6 w-6 rotate-180" />
           </button>
        </div>

        {/* Admin Banner */}
        {isAdmin && (
          <div className="mb-8 px-0 animate-in zoom-in-95 duration-500">
            <Link 
              href="/admin/dashboard" 
              className="flex items-center justify-between p-7 bg-primary text-white rounded-[3rem] shadow-xl shadow-primary/20 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <ShieldAlert className="h-7 w-7 text-white/90" />
                </div>
                <div>
                  <h4 className="font-black text-lg">لوحة تحكم المديرة</h4>
                  <p className="text-[10px] text-white/60 font-bold">إدارة المنتجات، الطلبات، والزبائن</p>
                </div>
              </div>
              <ChevronLeft className="h-6 w-6 text-white/40 group-hover:translate-x-[-4px] transition-transform relative z-10" />
            </Link>
          </div>
        )}

        {/* Order Tracking Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-premium dark:shadow-none mb-8 border border-transparent dark:border-zinc-800">
          <h3 className="text-sm font-black text-primary dark:text-zinc-400 mb-8 text-right pr-2">تتبع الطلبات</h3>
          <div className="flex justify-between items-start px-2">
            {TRACKING_STEPS.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary/40 dark:text-zinc-600">
                  <step.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] font-black text-primary/30 dark:text-zinc-600">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Menu List */}
        <div className="space-y-4 mb-10">
          {[...MENU_ITEMS, ...SECONDARY_MENU].map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href}
              className="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 shadow-premium dark:shadow-none flex items-center justify-between group hover:border-primary/10 border border-transparent dark:border-zinc-800 transition-all"
            >
              <ChevronLeft className="h-5 w-5 text-primary/10 dark:text-zinc-700 group-hover:text-primary dark:group-hover:text-zinc-400 transition-all" />
              <div className="flex items-center gap-4 text-right">
                <span className="font-black text-primary dark:text-zinc-200 text-sm">{item.label}</span>
                <div className="h-11 w-11 rounded-full bg-primary/5 dark:bg-zinc-800 flex items-center justify-center text-primary/40 dark:text-zinc-600">
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
          
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 shadow-premium dark:shadow-none flex items-center justify-between group border border-transparent dark:border-zinc-800">
            <Switch 
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              className="data-[state=checked]:bg-primary" 
            />
            <div className="flex items-center gap-4 text-right">
              <span className="font-black text-primary dark:text-zinc-200 text-sm">الوضع الليلي</span>
              <div className="h-11 w-11 rounded-full bg-primary/5 dark:bg-zinc-800 flex items-center justify-center text-primary/40 dark:text-zinc-600">
                <Moon className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 h-16 rounded-[2rem] bg-white dark:bg-zinc-900 border border-primary/5 dark:border-zinc-800 text-primary/40 dark:text-zinc-500 font-black shadow-sm mb-12 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </button>

      </main>

      <BottomNav />
    </div>
  );
}
