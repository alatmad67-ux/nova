
"use client";

import React, { useMemo } from 'react';
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
  ShieldCheck,
  Info,
  Facebook,
  Instagram,
  Music2,
  Send
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
    <div className="min-h-screen bg-[#fff9f9] flex items-center justify-center text-primary font-black animate-pulse">
      جاري تحميل عالمكِ الخاص...
    </div>
  );
  
  if (!user) {
    router.push('/login');
    return null;
  }

  const MENU_ITEMS = [
    { label: "الطلبات", icon: ReceiptText, href: "/account/orders" },
    { label: "العناوين", icon: MapPin, href: "/account/addresses" },
    { label: "المفضلة", icon: Heart, href: "/wishlist" },
    { label: "الإشعارات", subLabel: "تنبيهات حالة الطلب", icon: Bell, href: "/account/notifications" },
    { label: "إعدادات الحساب", icon: Settings, href: "/account/details" },
  ];

  const SECONDARY_MENU = [
    { label: "المساعدة والدعم", subLabel: "استشارة مجانية مع د.لينا عبر واتساب", icon: MessageSquare, href: "/support" },
    { label: "سياسة الخصوصية", icon: ShieldCheck, href: "/privacy" },
    { label: "عن التطبيق", icon: Info, href: "/about" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9f9] font-arabic pb-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <main className="flex-grow container mx-auto px-5 py-6 relative z-10 max-w-lg">
        
        {/* Profile Header section - subtle and neat */}
        <div className="flex flex-col items-center mb-8 pt-4">
          <Avatar className="h-20 w-20 border-4 border-white shadow-lg mb-4">
            <AvatarImage src={profile?.photoURL || user.photoURL || ''} />
            <AvatarFallback className="bg-primary/5 text-primary font-black text-2xl">
              {profile?.displayName?.[0] || user.displayName?.[0] || 'N'}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-black text-primary">
            {profile?.displayName || user.displayName || 'جميلة نوفا'}
          </h2>
          <p className="text-[10px] text-primary/40 font-bold mt-1">
            {user.email || user.phoneNumber}
          </p>
        </div>

        {/* Main Menu List */}
        <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden mb-4">
          {MENU_ITEMS.map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href}
              className="flex items-center justify-between p-5 hover:bg-accent/30 transition-colors border-b border-primary/5 last:border-none group"
            >
              <ChevronLeft className="h-5 w-5 text-primary/20 group-hover:translate-x-[-4px] transition-transform" />
              <div className="flex items-center gap-4 text-right">
                <div className="flex flex-col">
                  <span className="font-black text-primary text-sm">{item.label}</span>
                  {item.subLabel && <span className="text-[9px] text-primary/30 font-bold">{item.subLabel}</span>}
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary/60">
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}

          {/* Night Mode Toggle */}
          <div className="flex items-center justify-between p-5 border-t border-primary/5">
            <Switch className="data-[state=checked]:bg-primary" />
            <div className="flex items-center gap-4 text-right">
              <span className="font-black text-primary text-sm">الوضع الليلي</span>
              <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary/60">
                <Moon className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Secondary Menu Items */}
          {SECONDARY_MENU.map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href}
              className="flex items-center justify-between p-5 hover:bg-accent/30 transition-colors border-t border-primary/5 group"
            >
              <ChevronLeft className="h-5 w-5 text-primary/20 group-hover:translate-x-[-4px] transition-transform" />
              <div className="flex items-center gap-4 text-right">
                <div className="flex flex-col">
                  <span className="font-black text-primary text-sm">{item.label}</span>
                  {item.subLabel && <span className="text-[9px] text-primary/30 font-bold">{item.subLabel}</span>}
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary/60">
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Logout Section - Matches Image Style */}
        <div className="bg-white rounded-[2rem] border border-primary/5 shadow-sm p-4 mb-10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-2 text-red-500 font-black group"
          >
            <ChevronLeft className="h-5 w-5 text-red-100 group-hover:translate-x-[-4px] transition-transform" />
            <div className="flex items-center gap-4">
              <span>تسجيل الخروج</span>
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <LogOut className="h-5 w-5" />
              </div>
            </div>
          </button>
        </div>

        {/* Social Icons - Circular buttons at bottom */}
        <div className="flex justify-center gap-4 mb-8">
          {[
            { icon: Send, color: "text-red-500" },
            { icon: Music2, color: "text-red-500" },
            { icon: Instagram, color: "text-red-500" },
            { icon: Facebook, color: "text-red-500" },
          ].map((social, i) => (
            <button key={i} className="h-14 w-14 rounded-full bg-white border border-primary/5 shadow-sm flex items-center justify-center hover:scale-110 transition-transform">
              <social.icon className={cn("h-6 w-6", social.color)} />
            </button>
          ))}
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
