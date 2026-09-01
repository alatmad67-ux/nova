
"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function AdminHeader() {
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  return (
    <header className="h-20 bg-black/80 backdrop-blur-xl border-b border-white/5 flex items-center px-8 justify-between sticky top-0 z-50">
      <Link href="/admin/dashboard" className="flex items-center gap-3 group">
        <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center celestial-glow">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <div>
          <span className="text-2xl font-black gold-text tracking-widest">NOVA</span>
          <span className="text-[8px] block text-white/40 font-bold uppercase tracking-[0.2em] -mt-1">Control Panel</span>
        </div>
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        <Link href="/admin/dashboard" className="text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">الرئيسية</Link>
        <Link href="/admin/products" className="text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">المنتجات</Link>
        <Link href="/admin/orders" className="text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">الطلبات</Link>
        <Link href="/admin/slider" className="text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">السلايدر</Link>
        <Link href="/admin/settings" className="text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">الإعدادات</Link>
      </nav>

      <button 
        onClick={handleLogout}
        className="h-10 px-4 rounded-xl bg-red-500/10 text-red-500 text-xs font-black hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
      >
        <LogOut className="h-3 w-3" />
        خروج
      </button>
    </header>
  );
}
