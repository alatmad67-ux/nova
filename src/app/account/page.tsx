
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
  Package, 
  MapPin, 
  Heart, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ShieldCheck, 
  HelpCircle,
  Moon,
  Sparkles
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { STORE_ID } from '@/lib/constants';

export default function AccountPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading } = useUser();

  const profileRef = useMemo(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(profileRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black animate-pulse">جاري تحميل عالمكِ الخاص...</div>;
  
  if (!user) {
    router.push('/login');
    return null;
  }

  const MENU_GROUPS = [
    {
      title: "مشترياتي",
      items: [
        { label: "طلباتي", icon: Package, href: "/account/orders", color: "text-blue-500" },
        { label: "المفضلة", icon: Heart, href: "/wishlist", color: "text-red-500" },
        { label: "عناويني", icon: MapPin, href: "/account/addresses", color: "text-green-500" },
      ]
    },
    {
      title: "الإعدادات",
      items: [
        { label: "تفاصيل الحساب", icon: User, href: "/account/details", color: "text-purple-500" },
        { label: "الإشعارات", icon: Bell, href: "/account/notifications", color: "text-orange-500" },
        { label: "الوضع الليلي", icon: Moon, href: "#", color: "text-slate-700", badge: "قريباً" },
      ]
    },
    {
      title: "الدعم والمعلومات",
      items: [
        { label: "المساعدة والدعم", icon: HelpCircle, href: "/help", color: "text-cyan-500" },
        { label: "سياسة الخصوصية", icon: ShieldCheck, href: "/privacy", color: "text-emerald-500" },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-arabic pb-32">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        {/* Profile Header */}
        <div className="bg-white rounded-[3rem] p-8 mb-8 border border-border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-primary/5" />
          <div className="relative flex flex-col items-center">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl mb-4">
              <AvatarImage src={profile?.photoURL || user.photoURL || ''} />
              <AvatarFallback className="bg-primary text-white text-2xl font-black">
                {profile?.displayName?.[0] || user.displayName?.[0] || 'N'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-black text-primary mb-1">{profile?.displayName || user.displayName || 'عميلة نوفا'}</h2>
            <p className="text-primary/40 text-sm font-bold">{user.email || user.phoneNumber}</p>
          </div>
        </div>

        {/* Menu Groups */}
        <div className="space-y-8">
          {MENU_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h3 className="text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] pr-4">{group.title}</h3>
              <div className="bg-white rounded-[2rem] border border-border shadow-sm overflow-hidden">
                {group.items.map((item, iIdx) => (
                  <Link 
                    key={iIdx} 
                    href={item.href}
                    className="flex items-center justify-between p-5 hover:bg-accent/30 transition-colors border-b last:border-none border-border/50 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl bg-accent/50 ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-primary group-hover:translate-x-[-4px] transition-transform">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.badge && <span className="text-[9px] font-black bg-primary/5 text-primary px-2 py-0.5 rounded-full">{item.badge}</span>}
                      <ChevronLeft className="h-4 w-4 text-primary/20 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full h-16 rounded-[2rem] text-red-500 hover:text-red-600 hover:bg-red-50 font-black gap-3 mt-4"
          >
            <LogOut className="h-5 w-5" />
            تسجيل الخروج
          </Button>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-primary/20 mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">NOVA VERSION 2.0</span>
          </div>
          <p className="text-[10px] text-primary/10 font-bold uppercase">صمم بكل حب في العراق © 2026</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
