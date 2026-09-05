
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useDoc, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Header } from '@/components/layout/Header';
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
  Clock,
  Package,
  Truck,
  CheckCircle2,
  ReceiptText
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading } = useUser();

  const profileRef = useMemo(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black animate-pulse">
      جاري تحميل عالمكِ الخاص...
    </div>
  );
  
  if (!user) {
    router.push('/login');
    return null;
  }

  const ORDER_STATUSES = [
    { label: "قيد الانتظار", icon: Clock, color: "text-primary" },
    { label: "قيد التجهيز", icon: Package, color: "text-primary" },
    { label: "في الطريق", icon: Truck, color: "text-primary" },
    { label: "تم التسليم", icon: CheckCircle2, color: "text-primary" },
  ];

  const MENU_ITEMS = [
    { label: "الطلبات", icon: ReceiptText, href: "/account/orders" },
    { label: "العناوين", icon: MapPin, href: "/account/addresses" },
    { label: "المفضلة", icon: Heart, href: "/wishlist" },
    { label: "الإشعارات", subLabel: "تنبيهات حالة الطلب", icon: Bell, href: "/account/notifications" },
    { label: "إعدادات الحساب", icon: Settings, href: "/account/details" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9f9] font-arabic pb-32 relative overflow-hidden">
      {/* Background blobs for that soft look */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      
      <main className="flex-grow container mx-auto px-5 py-6 relative z-10">
        {/* Title */}
        <h1 className="text-2xl font-black text-primary mb-6 text-right px-2">حسابي</h1>

        {/* Profile Card */}
        <Link href="/account/details" className="block">
          <div className="bg-white rounded-[2rem] p-6 mb-8 border border-primary/5 shadow-sm flex items-center justify-between">
            <ChevronLeft className="h-5 w-5 text-primary/20" />
            <div className="flex items-center gap-4 text-right">
              <div>
                <h2 className="text-xl font-black text-primary">
                  {profile?.displayName || user.displayName || 'جميلة نوفا'}
                </h2>
                <p className="text-[10px] text-primary/40 font-bold">
                  {user.email || user.phoneNumber}
                </p>
              </div>
              <Avatar className="h-16 w-16 border-2 border-primary/5">
                <AvatarImage src={profile?.photoURL || user.photoURL || ''} />
                <AvatarFallback className="bg-primary/5 text-primary font-black">
                  {profile?.displayName?.[0] || user.displayName?.[0] || 'N'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </Link>

        {/* Orders Section */}
        <div className="mb-8">
          <h3 className="text-lg font-black text-primary mb-4 text-right px-2">الطلبات</h3>
          <div className="bg-white rounded-[2rem] p-6 border border-primary/5 shadow-sm">
            <div className="grid grid-cols-4 gap-2">
              {ORDER_STATUSES.map((status, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-[#fff5f5] flex items-center justify-center border border-primary/5">
                    <status.icon className={cn("h-6 w-6", status.color)} />
                  </div>
                  <span className="text-[9px] font-black text-primary/60 whitespace-nowrap">
                    {status.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-[2rem] border border-primary/5 shadow-sm overflow-hidden mb-6">
          {MENU_ITEMS.map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href}
              className="flex items-center justify-between p-5 hover:bg-accent/30 transition-colors border-b last:border-none border-primary/5 group"
            >
              <ChevronLeft className="h-5 w-5 text-primary/20 group-hover:translate-x-[-4px] transition-transform" />
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="font-black text-primary text-sm">{item.label}</p>
                  {item.subLabel && <p className="text-[9px] text-primary/30 font-bold mt-0.5">{item.subLabel}</p>}
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}

          {/* Night Mode Item */}
          <div className="flex items-center justify-between p-5 border-t border-primary/5">
            <Switch className="data-[state=checked]:bg-primary" />
            <div className="flex items-center gap-4 text-right">
              <span className="font-black text-primary text-sm">الوضع الليلي</span>
              <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                <Moon className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button 
          onClick={handleLogout}
          variant="ghost" 
          className="w-full h-16 rounded-[2rem] text-red-500 hover:text-red-600 hover:bg-red-50 font-black gap-3 mt-4 border border-red-100"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
