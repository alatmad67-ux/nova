"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { LogOut, LayoutGrid, ShoppingBag, Package, Settings, Image as ImageIcon } from 'lucide-react';
import { useAuth, useDoc, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc } from 'firebase/firestore';
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const auth = useAuth();
  const router = useRouter();
  const db = useFirestore();
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'general') : null, [db]);
  const { data: settings } = useDoc(settingsRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/admin/login');
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-zinc-900 border-b border-border dark:border-zinc-800 flex items-center px-8 justify-between sticky top-0 z-50 transition-colors">
      <Link href="/admin/dashboard" className="flex items-center gap-4 group">
        {settings?.logo ? (
          <div className="relative h-10 w-24">
            <Image src={settings.logo} alt="NOVA" fill className="object-contain dark:brightness-110" />
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-xl font-black text-primary dark:text-zinc-100 tracking-widest uppercase">NOVA</span>
            <span className="text-[8px] block text-secondary font-bold uppercase tracking-[0.2em] -mt-1">Control Panel</span>
          </div>
        )}
      </Link>

      <nav className="hidden lg:flex items-center gap-8">
        {[
          { label: 'لوحة التحكم', href: '/admin/dashboard', icon: LayoutGrid },
          { label: 'المنتجات', href: '/admin/products', icon: ShoppingBag },
          { label: 'الطلبات', href: '/admin/orders', icon: Package },
          { label: 'السلايدر', href: '/admin/slider', icon: ImageIcon },
          { label: 'الإعدادات', href: '/admin/settings', icon: Settings },
        ].map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className="flex items-center gap-2 text-xs font-bold text-primary/60 dark:text-zinc-400 hover:text-primary dark:hover:text-zinc-100 transition-colors"
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <button 
          onClick={handleLogout}
          className="h-10 w-10 rounded-xl bg-accent dark:bg-zinc-800 flex items-center justify-center text-primary/60 dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
